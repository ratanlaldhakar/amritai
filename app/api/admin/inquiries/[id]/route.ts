import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let adminId = 'd5300000-0000-0000-0000-000000000000'; // fallback dummy uuid if none exists
    try {
      const body = await request.json();
      if (body.adminId) {
        adminId = body.adminId;
      }
    } catch {
      // Body might be empty, ignore
    }

    const success = await db.leads.resolve(id, adminId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Lead not found or resolution failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('API PATCH /api/admin/inquiries/[id] error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
