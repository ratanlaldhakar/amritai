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
      { data: funnelData },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase.from('students').select('status'),
    ]);

    // Compute status counts for funnel
    const activeCount = funnelData?.filter((s) => s.status === 'active').length || 0;
    const trialCount = funnelData?.filter((s) => s.status === 'trial_booked').length || 0;
    const leadCount = funnelData?.filter((s) => s.status === 'lead').length || 0;
    const inactiveCount = funnelData?.filter((s) => s.status === 'inactive').length || 0;

    const totalCount = funnelData?.length || 0;
    const conversionRate = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : '0';

    // Fetch recent handoff inquiries
    const { data: recentInquiries } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: String(totalStudents || 0),
        pendingLeads: String(pendingLeads || 0),
        messagesToday: String(messagesToday || 0),
        conversionRate: `${conversionRate}%`,
      },
      funnel: {
        totalLeads: leadCount + trialCount + activeCount + inactiveCount,
        trialsScheduled: trialCount,
        activeMembers: activeCount,
      },
      recentInquiries: recentInquiries || [],
    });
  } catch (error: any) {
    logger.error('API GET /api/admin/stats error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
