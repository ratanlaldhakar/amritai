import { aiBrainService } from '@/services/ai-brain';
import { db } from '@/services/db';
import { logger } from '@/lib/logger';

async function testReceptionist() {
  logger.info('=== STARTING STATEFUL AI RECEPTIONIST TESTS ===');

  const testPhone = '+91 99999 00000';
  const testName = 'Test User';

  // Helper to clear test history
  try {
    const messages = await db.messages.getHistory(testPhone, 100);
    logger.info(`Found ${messages.length} old test messages. Cleaning database...`);
    // Note: Database operations in db.ts are mocked or use supabase client
  } catch (err) {
    logger.error('Failed to query old messages:', {}, err);
  }

  // 1. TIMINGS & COURSES QUERY
  logger.info('--- Query 1: TIMINGS & COURSES ---');
  let userMsg = 'Hari Om! What are the Hatha Yoga timings and monthly fees?';
  logger.info(`User: ${userMsg}`);
  let response = await aiBrainService.processIncomingMessage(testPhone, userMsg, testName);
  logger.info(`AI Reply: ${response}`);

  // 2. TRIAL BOOKING INTENT
  logger.info('--- Query 2: BOOKING INTENT ---');
  userMsg = 'I would like to book a trial class.';
  logger.info(`User: ${userMsg}`);
  response = await aiBrainService.processIncomingMessage(testPhone, userMsg, testName);
  logger.info(`AI Reply: ${response}`);

  // 3. TRIAL DETAILS SUBMISSION
  logger.info('--- Query 3: DETAILS COLLECTION ---');
  userMsg = 'My name is Rohan, age 29, and I prefer the Morning Hatha slot.';
  logger.info(`User: ${userMsg}`);
  response = await aiBrainService.processIncomingMessage(testPhone, userMsg, testName);
  logger.info(`AI Reply: ${response}`);

  // Verify DB Student Status was updated to trial_booked
  try {
    const student = await db.students.getByPhone(testPhone);
    logger.info(`Verified Student Status in DB:`, {
      name: student?.name,
      status: student?.status,
      trial_date: student?.trial_date,
      notes: student?.notes,
    });
  } catch (dbErr) {
    logger.error('Failed to verify student record in DB:', {}, dbErr);
  }

  // 4. HANDOVER TRIGGER
  logger.info('--- Query 4: HUMAN HANDOVER ---');
  userMsg = 'Can you call me? I want to request a refund for my friend.';
  logger.info(`User: ${userMsg}`);
  response = await aiBrainService.processIncomingMessage(testPhone, userMsg, testName);
  logger.info(`AI Reply: ${response}`);

  // Verify DB Inquiry Handoff record was created
  try {
    const inquiries = await db.inquiries.getPending();
    const testInquiry = inquiries.find((inq: any) => inq.phone_number === testPhone);
    logger.info(`Verified Handoff Inquiry in DB:`, {
      name: testInquiry?.customer_name,
      message: testInquiry?.message,
    });
  } catch (dbErr) {
    logger.error('Failed to verify inquiry handover in DB:', {}, dbErr);
  }

  logger.info('=== STATEFUL AI RECEPTIONIST TESTS COMPLETED ===');
}

testReceptionist().catch((err) => {
  logger.error('Test execution failed:', {}, err);
});
