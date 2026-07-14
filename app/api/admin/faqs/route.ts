import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const faqs = await db.faqs.getAllWithUnpublished();
    return NextResponse.json({ success: true, faqs });
  } catch (error: any) {
    logger.error('API GET /api/admin/faqs error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const created = await db.faqs.create({
      category: body.category,
      question: body.question,
      answer: body.answer,
      is_published: body.is_published ?? true,
    });

    if (!created) {
      return NextResponse.json({ success: false, error: 'Failed to create FAQ' }, { status: 500 });
    }

    return NextResponse.json({ success: true, faq: created });
  } catch (error: any) {
    logger.error('API POST /api/admin/faqs error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
