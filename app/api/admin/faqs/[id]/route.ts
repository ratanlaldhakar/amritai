import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {
      category: body.category,
      question: body.question,
      answer: body.answer,
      is_published: body.is_published,
      priority: Number(body.priority ?? 0),
      keywords: body.keywords || null,
      tags: body.tags || null,
      language: body.language || 'en',
      updated_by: body.updated_by || null,
      embedding_status: body.embedding_status || 'pending',
    };

    const updated = await db.knowledge_base.update(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, faq: updated });
  } catch (error: any) {
    logger.error('API PUT /api/admin/faqs/[id] error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await db.knowledge_base.delete(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('API DELETE /api/admin/faqs/[id] error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
