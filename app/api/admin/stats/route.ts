import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = getSupabaseServiceRole();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalStudents },
      { count: pendingLeads },
      { count: messagesToday },
      { count: activeStudents },
      { count: totalLeads },
      { count: trialsScheduled },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('trial_bookings').select('*', { count: 'exact', head: true }),
    ]);

    const leadsCount = totalLeads || 0;
    const activeCount = activeStudents || 0;
    const conversionRate = leadsCount > 0 ? ((activeCount / leadsCount) * 100).toFixed(1) : '0';

    // Fetch recent handoff leads and map to inquiries frontend structure
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentInquiries = (recentLeads || []).map((lead) => ({
      id: lead.id,
      phone_number: lead.phone_number,
      customer_name: lead.name || 'Unknown User',
      message: lead.notes || `CRM Contact Profile`,
      status: lead.status === 'new' ? 'pending' : 'resolved',
      created_at: lead.created_at,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: String(totalStudents || 0),
        pendingLeads: String(pendingLeads || 0),
        messagesToday: String(messagesToday || 0),
        conversionRate: `${conversionRate}%`,
      },
      funnel: {
        totalLeads: leadsCount,
        trialsScheduled: trialsScheduled || 0,
        activeMembers: activeCount,
      },
      recentInquiries: recentInquiries || [],
    });
  } catch (error: any) {
    logger.error('API GET /api/admin/stats error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
