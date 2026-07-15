import { NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const leads = await db.leads.getAll();
    
    // Map leads structure to match the frontend expectations for "inquiries"
    const inquiries = leads.map((lead) => ({
      id: lead.id,
      phone_number: lead.phone_number,
      customer_name: lead.name || 'Unknown User',
      message: lead.notes || `CRM Lead (Status: ${lead.status})`,
      status: lead.status === 'new' ? 'pending' : 'resolved',
      assigned_to: lead.assigned_to,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      // Extended fields
      interest: lead.interest,
      preferred_batch: lead.preferred_batch,
      goal: lead.goal,
      source: lead.source,
      follow_up_date: lead.follow_up_date,
      last_contact_at: lead.last_contact_at,
      city: lead.city,
      health_notes: lead.health_notes
    }));

    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    logger.error('API GET /api/admin/inquiries error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
