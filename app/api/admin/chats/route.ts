import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { whatsAppClient } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (phone) {
      // Fetch full chat history for this user
      const history = await db.messages.getHistory(phone, 50);
      return NextResponse.json({ success: true, history });
    }

    // Fetch conversation lists
    const chats = await db.messages.getConversations();
    return NextResponse.json({ success: true, chats });
  } catch (error: any) {
    logger.error('API GET /api/admin/chats error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing to or text parameters' },
        { status: 400 }
      );
    }

    logger.info(`Sending manual admin WhatsApp response to ${to}`);

    // Call Meta API
    const metaResponse: any = await whatsAppClient.sendTextMessage(to, text);
    const messageId = metaResponse?.messages?.[0]?.id || `wamid.admin.${Date.now()}`;

    // Get customer name from previous message if exists
    const existing = await db.students.getByPhone(to);
    const customerName = existing?.name || 'WhatsApp User';

    // Log the outgoing message in Supabase
    const savedMsg = await db.messages.save({
      message_id: messageId,
      phone_number: to,
      customer_name: customerName,
      text,
      direction: 'outgoing',
      whatsapp_timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: savedMsg });
  } catch (error: any) {
    logger.error('API POST /api/admin/chats error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
