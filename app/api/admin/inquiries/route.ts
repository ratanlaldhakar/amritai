import { NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const inquiries = await db.inquiries.getAll();
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    logger.error('API GET /api/admin/inquiries error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
