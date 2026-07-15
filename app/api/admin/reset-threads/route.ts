import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = getSupabaseServiceRole();
    
    // 1. Reset threads
    const { error: updateError } = await supabase
      .from('conversation_threads')
      .update({
        ai_enabled: true,
        status: 'bot_handling',
        handover_reason: null,
      })
      .neq('phone_number', '+00000000000'); // Safely target all records

    if (updateError) {
      logger.error('Failed to reset conversation threads in database:', {}, updateError);
      return NextResponse.json({ success: false, error: updateError }, { status: 500 });
    }

    // 2. Fetch all threads to verify
    const { data: threads, error: fetchError } = await supabase
      .from('conversation_threads')
      .select('*');

    if (fetchError) {
      logger.error('Failed to fetch threads for verification:', {}, fetchError);
      return NextResponse.json({
        success: true,
        message: 'Reset succeeded, but failed to fetch thread states for verification.',
        error: fetchError.message,
      });
    }

    // 3. Fetch last 5 messages to check history
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('whatsapp_timestamp', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'All conversation threads successfully reset! AI chatbot is now re-enabled for all phone numbers.',
      threads: threads || [],
      messages: messages || [],
      msgError: msgError ? msgError.message : null
    });
  } catch (err: any) {
    logger.error('API GET /api/admin/reset-threads error:', {}, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
