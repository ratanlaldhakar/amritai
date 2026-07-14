import { NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const students = await db.students.getAll();
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    logger.error('API GET /api/admin/students error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
