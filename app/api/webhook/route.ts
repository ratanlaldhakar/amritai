import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { withErrorHandling, ValidationError, UnauthorizedError } from '@/lib/error';
import { getSupabaseServiceRole } from '@/lib/supabase';
import { aiBrainService } from '@/services/ai-brain';
import { whatsAppClient } from '@/lib/whatsapp';
import { db } from '@/services/db';

// Sliding Window Rate Limiting memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ipOrPhone: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrPhone);

  if (!record) {
    rateLimitMap.set(ipOrPhone, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ipOrPhone, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// HMAC SHA256 Webhook Signature Verification
function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | undefined
): boolean {
  if (!appSecret) {
    logger.warn('WhatsApp App Secret not configured. Skipping webhook signature verification.');
    return true;
  }

  if (!signatureHeader) {
    logger.error('Signature verification failed: Missing x-hub-signature-256 header.');
    return false;
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    logger.error('Signature verification failed: Invalid header format.');
    return false;
  }

  const expectedSignature = parts[1];
  const calculatedSignature = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (err) {
    logger.error('Signature verification mismatch timingSafeEqual failed.', {}, err);
    return false;
  }
}

// Webhook input validation Zod Schema
const webhookSchema = z.object({
  object: z.string(),
  entry: z
    .array(
      z.object({
        id: z.string(),
        changes: z.array(
          z.object({
            value: z.object({
              messaging_product: z.string().optional(),
              metadata: z.any().optional(),
              contacts: z
                .array(
                  z.object({
                    profile: z.object({
                      name: z.string(),
                    }),
                    wa_id: z.string(),
                  })
                )
                .optional(),
              messages: z
                .array(
                  z.object({
                    from: z.string(),
                    id: z.string(),
                    timestamp: z.string(),
                    type: z.string(),
                    text: z.object({ body: z.string() }).optional(),
                    interactive: z
                      .object({
                        type: z.string(),
                        button_reply: z.object({ id: z.string(), title: z.string() }).optional(),
                        list_reply: z
                          .object({
                            id: z.string(),
                            title: z.string(),
                            description: z.string().optional(),
                          })
                          .optional(),
                      })
                      .optional(),
                  })
                )
                .optional(),
            }),
            field: z.string(),
          })
        ),
      })
    )
    .optional(),
});

/**
 * GET - WhatsApp Webhook Verification
 * This endpoint verifies the webhook URL with Facebook Developer Portal.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  logger.info('Received WhatsApp Webhook verification request', { mode, token });

  if (mode && token) {
    if (whatsAppClient.verifyWebhook(mode, token, env.WHATSAPP_VERIFY_TOKEN)) {
      logger.info('WhatsApp Webhook verified successfully');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      logger.warn('WhatsApp Webhook verification failed: Token mismatch', {
        expected: env.WHATSAPP_VERIFY_TOKEN,
        received: token,
      });
      throw new UnauthorizedError('Verification token mismatch');
    }
  }

  throw new ValidationError('Missing hub.mode or hub.verify_token parameters');
});

/**
 * POST - WhatsApp Webhook Receiver
 * This endpoint receives incoming WhatsApp events and stores messages in Supabase.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // 1. Enforce Webhook Rate Limiting by IP Address
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown-ip';
  if (!checkRateLimit(clientIp, 30, 60000)) {
    logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. Read Raw Payload for Signature Verification
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-hub-signature-256');

  // Skip signature verification if we are not in production or mock credentials are used
  const whatsappAppSecret = process.env.WHATSAPP_APP_SECRET;
  if (
    process.env.NODE_ENV === 'production' &&
    !verifyWebhookSignature(rawBody, signatureHeader, whatsappAppSecret)
  ) {
    logger.error('Unauthorized Webhook Signature calculation mismatch.');
    return NextResponse.json({ error: 'Invalid payload signature' }, { status: 401 });
  }

  // 3. Safe Parse Body with Zod Schema
  let parsedPayload: any;
  try {
    const json = JSON.parse(rawBody);
    parsedPayload = webhookSchema.parse(json);
  } catch (err) {
    logger.error('Zod JSON validation failed for incoming WhatsApp Webhook:', {}, err);
    throw new ValidationError('Malformed webhook JSON format');
  }

  logger.info('Received validated WhatsApp Webhook payload', {
    object: parsedPayload.object,
    entryCount: parsedPayload.entry?.length,
  });

  if (parsedPayload.object !== 'whatsapp_business_account') {
    logger.warn('Unexpected webhook event type', { object: parsedPayload.object });
    throw new ValidationError('Unsupported webhook source');
  }

  const supabaseServer = getSupabaseServiceRole();
  const entries = parsedPayload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value;
      if (change.field !== 'messages') continue;

      if (value.messages) {
        const messages = value.messages || [];
        const contact = value.contacts?.[0];
        const customerName = contact?.profile?.name || 'Unknown WhatsApp User';

        for (const message of messages) {
          const from = message.from;
          const messageId = message.id;
          const timestamp = new Date(parseInt(message.timestamp, 10) * 1000);
          const messageType = message.type;

          let textBody = '';
          if (messageType === 'text' && message.text) {
            textBody = message.text.body;
          } else if (messageType === 'interactive' && message.interactive) {
            const interactive = message.interactive;
            if (interactive.type === 'button_reply' && interactive.button_reply) {
              textBody = interactive.button_reply.title;
            } else if (interactive.type === 'list_reply' && interactive.list_reply) {
              textBody = interactive.list_reply.title;
            } else {
              textBody = `[Interactive selection: ${interactive.type}]`;
            }
          } else {
            textBody = `[Message of type: ${messageType}]`;
          }

          logger.info(`Extracting message parameters`, {
            customerName,
            phoneNumber: from,
            messageId,
            timestamp: timestamp.toISOString(),
            text: textBody,
          });

          // Check if message already exists (prevent duplicate delivery retries)
          const { data: existingMsg, error: selectError } = await supabaseServer
            .from('messages')
            .select('id')
            .eq('message_id', messageId)
            .maybeSingle();

          if (selectError) {
            logger.error('Error checking for existing message:', {}, selectError);
          }

          if (existingMsg) {
            logger.info(`Message ${messageId} already exists in database, skipping insertion.`);
            continue;
          }

          // Mark message as read on Meta
          try {
            await whatsAppClient.markAsRead(messageId);
            await whatsAppClient.typingIndicator(from, true);
          } catch (metaErr) {
            logger.warn('Failed to set read receipt or typing state on Meta API:', {}, metaErr);
          }

          // Insert incoming message record
          const savedMsg = await db.messages.save({
            message_id: messageId,
            phone_number: from,
            customer_name: customerName,
            text: textBody,
            direction: 'incoming',
            whatsapp_timestamp: timestamp.toISOString(),
          });

          if (!savedMsg) {
            logger.error('Failed to store incoming message in Supabase', { messageId });
            throw new Error('Failed to store message');
          }

          logger.info(`Message ${messageId} successfully stored in Supabase.`);

          // Process the message through AIBrain (which resolves context and calls Gemini)
          const replyText = await aiBrainService.processIncomingMessage(
            from,
            textBody,
            customerName
          );

          // Turn off typing indicator
          try {
            await whatsAppClient.typingIndicator(from, false);
          } catch (metaErr) {
            logger.warn('Failed to disable typing state on Meta API:', {}, metaErr);
          }

          // Reply specifically as context thread response on WhatsApp
          try {
            await whatsAppClient.reply(from, replyText, messageId);
            logger.info(`Successfully replied to customer ${from} via context thread on WhatsApp.`);
          } catch (whatsappSendError) {
            logger.error(
              'Failed to send AI response thread back to customer on WhatsApp:',
              { from },
              whatsappSendError
            );
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, message: 'Webhook event processed' }, { status: 200 });
});
