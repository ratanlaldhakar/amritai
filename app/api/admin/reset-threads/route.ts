import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = getSupabaseServiceRole();
    const { error } = await supabase
      .from('conversation_threads')
      .update({
        ai_enabled: true,
        status: 'bot_handling',
        handover_reason: null,
      })
      .neq('phone_number', '+00000000000'); // Safely target all records

    if (error) {
      logger.error('Failed to reset conversation threads in database:', {}, error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'All conversation threads successfully reset! AI chatbot is now re-enabled for all phone numbers.',
    });
  } catch (err: any) {
    logger.error('API GET /api/admin/reset-threads error:', {}, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
