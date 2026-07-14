import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Whitelist update keys
    const updates = {
      name: body.name,
      status: body.status,
      batch_id: body.batch_id || null,
      notes: body.notes,
      trial_date: body.trial_date || null,
    };

    const updated = await db.students.update(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Student not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    logger.error('API PATCH /api/admin/students/[id] error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
