import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

import { RECEPTIONIST_SYSTEM_PROMPT } from '@/lib/constants';

export async function GET() {
  try {
    const [
      aiEnabled,
      primaryModel,
      temperature,
      monthlyFee,
      quarterlyFee,
      morningStart,
      morningEnd,
      systemPrompt,
    ] = await Promise.all([
      db.settings.get<boolean>('ai_enabled'),
      db.settings.get<string>('primary_model'),
      db.settings.get<number>('temperature'),
      db.settings.get<number>('monthly_fee'),
      db.settings.get<number>('quarterly_fee'),
      db.settings.get<string>('morning_start'),
      db.settings.get<string>('morning_end'),
      db.settings.get<string>('system_prompt'),
    ]);

    return NextResponse.json({
      success: true,
      settings: {
        aiEnabled: aiEnabled ?? true,
        primaryModel: primaryModel ?? 'llama-3.3-70b-versatile',
        temperature: temperature ?? 0.3,
        monthlyFee: monthlyFee ?? 1500,
        quarterlyFee: quarterlyFee ?? 4000,
        morningStart: morningStart ?? '06:00',
        morningEnd: morningEnd ?? '07:30',
        systemPrompt: systemPrompt ?? RECEPTIONIST_SYSTEM_PROMPT,
      },
    });
  } catch (error: any) {
    logger.error('API GET /api/admin/settings error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Save keys sequentially or in parallel
    const promises: Promise<boolean>[] = [];
    if (body.aiEnabled !== undefined) promises.push(db.settings.set('ai_enabled', body.aiEnabled));
    if (body.primaryModel !== undefined)
      promises.push(db.settings.set('primary_model', body.primaryModel));
    if (body.temperature !== undefined)
      promises.push(db.settings.set('temperature', body.temperature));
    if (body.monthlyFee !== undefined)
      promises.push(db.settings.set('monthly_fee', body.monthlyFee));
    if (body.quarterlyFee !== undefined)
      promises.push(db.settings.set('quarterly_fee', body.quarterlyFee));
    if (body.morningStart !== undefined)
      promises.push(db.settings.set('morning_start', body.morningStart));
    if (body.morningEnd !== undefined)
      promises.push(db.settings.set('morning_end', body.morningEnd));
    if (body.systemPrompt !== undefined)
      promises.push(db.settings.set('system_prompt', body.systemPrompt));

    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('API POST /api/admin/settings error:', {}, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
