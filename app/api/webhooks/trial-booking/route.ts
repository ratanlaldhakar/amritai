import { NextRequest, NextResponse } from 'next/server';
import { db, normalizePhoneNumber } from '@/services/db';
import { whatsAppClient } from '@/lib/whatsapp';
import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook authorization header (if configured in environment)
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.DATABASE_WEBHOOK_SECRET;
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      logger.warn('Unauthorized webhook request block.');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    logger.info('Database webhook received:', payload);

    const { record, type, table } = payload;

    // Verify it is a valid trial_booking INSERT event
    if (table !== 'trial_bookings' || type !== 'INSERT' || !record) {
      return NextResponse.json(
        { success: true, message: 'Event ignored (not a trial_bookings INSERT)' },
        { status: 200 }
      );
    }

    const bookingId = record.id;
    const phoneRaw = record.phone;
    const name = record.name || 'Customer';
    const batch = record.batch || '';
    const goal = record.goal || null;
    const city = record.city || null;
    const source = record.source || 'Website';
    const experience = record.experience || 'N/A';
    const notes = record.notes || 'None';

    if (!phoneRaw) {
      logger.error('Webhook payload is missing phone number.');
      return NextResponse.json({ success: false, error: 'Missing phone number' }, { status: 400 });
    }

    const canonicalPhone = normalizePhoneNumber(phoneRaw);
    const confirmMessageId = `wamid.booking-confirm.${bookingId}`;

    // 2. Idempotency Check: Verify if confirmation has already been sent for this booking ID
    const supabase = getSupabaseServiceRole();
    const { data: existingMessage, error: checkError } = await supabase
      .from('messages')
      .select('id')
      .eq('message_id', confirmMessageId)
      .maybeSingle();

    if (checkError) {
      logger.error('Error verifying idempotency check:', checkError);
    }

    if (existingMessage) {
      logger.info(`Webhook event already processed for booking ID: ${bookingId}. Skipping to prevent duplication.`);
      return NextResponse.json(
        { success: true, message: 'Already processed (idempotent)' },
        { status: 200 }
      );
    }

    // 3. Upsert Lead in CRM leads table
    try {
      await db.leads.upsert({
        phone_number: canonicalPhone,
        name: name,
        status: 'trial_booked',
        interest: batch || 'Trial Booking',
        preferred_batch: batch,
        goal: goal,
        source: source,
        city: city,
        notes: `Trial booking created from website form. Experience: ${experience}. Notes: ${notes}`,
        follow_up_date: null,
      });
      logger.info(`CRM Lead successfully upserted for phone: ${canonicalPhone}`);
    } catch (err) {
      logger.error('Failed to upsert lead in database webhook handler:', err);
    }

    // 4. Send WhatsApp Confirmation
    let messageBody = `[Automated Webhook Confirmation Sent] Trial booking received for batch: ${batch}`;
    try {
      logger.info(`Sending automated WhatsApp confirmation to: ${canonicalPhone}`);
      
      // Attempt sending Meta template confirmation
      try {
        await whatsAppClient.sendTemplate({
          to: canonicalPhone,
          templateName: 'trial_booking_confirm',
          languageCode: 'en_US',
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: name },
                { type: 'text', text: batch || 'preferred batch' }
              ]
            }
          ]
        });
        logger.info(`WhatsApp template confirmation delivered to ${canonicalPhone}`);
      } catch (templateErr: any) {
        logger.warn('WhatsApp template delivery failed. Falling back to direct text message:', {
          error: templateErr.message,
        });

        // Text fallback message
        const confirmationText = `Hari Om! 🙏 ${name} ji,\n\nWe have received your trial class booking for the *${batch || 'scheduled'}* batch.\n\n📍 *Location:* 3-M-7, 2nd Floor, Near Vinay Stationers, Government Hospital Road, Bapunagar, Bhilwara.\n\nOur instructor Suresh Kumar ji will see you at the center. Please bring a yoga mat and arrive 5 minutes early. Thank you!`;

        await whatsAppClient.sendText({
          to: canonicalPhone,
          text: confirmationText,
        });
        logger.info(`WhatsApp fallback text confirmation delivered to ${canonicalPhone}`);
      }

      // 5. Store conversation log in message history using bookingId-based confirmMessageId
      await db.messages.save({
        message_id: confirmMessageId,
        phone_number: canonicalPhone,
        customer_name: name,
        text: messageBody,
        direction: 'outgoing',
        whatsapp_timestamp: new Date().toISOString(),
      });
      logger.info(`Conversation message log stored in database for booking ID: ${bookingId}`);

    } catch (waErr: any) {
      logger.error('Failed to send WhatsApp message or save chat logs:', waErr);
      return NextResponse.json(
        { success: false, error: 'Failed to complete WhatsApp delivery actions', details: waErr.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Booking confirmation successfully processed' },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Database Webhook critical exception:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
