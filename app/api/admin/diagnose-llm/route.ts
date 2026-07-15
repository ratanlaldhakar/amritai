import { NextResponse } from 'next/server';
import { generateGeminiText, GEMINI_MODELS } from '@/lib/gemini';
import { generateGroqText, GROQ_MODELS } from '@/lib/groq';
import { logger } from '@/lib/logger';

export async function GET() {
  const results: Record<string, any> = {};

  // Test Gemini API key
  try {
    results.gemini_env = {
      key_exists: !!process.env.GEMINI_API_KEY,
      key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 7) : 'missing',
    };
    logger.info('Diagnosing Gemini API connection...');
    const response = await generateGeminiText(
      "Test prompt: Say 'Gemini OK'",
      "You are a test runner",
      GEMINI_MODELS.GEMINI_2_5_FLASH,
      0.1
    );
    results.gemini_test = { success: true, response };
  } catch (err: any) {
    logger.error('Gemini API test execution failed:', {}, err);
    results.gemini_test = { success: false, error: err.message || err.toString() };
  }

  // Test Groq API key
  try {
    results.groq_env = {
      key_exists: !!process.env.GROQ_API_KEY,
      key_prefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 7) : 'missing',
    };
    logger.info('Diagnosing Groq API connection...');
    const response = await generateGroqText(
      "Test prompt: Say 'Groq OK'",
      "You are a test runner",
      GROQ_MODELS.LLAMA_3_1_8B,
      0.1
    );
    results.groq_test = { success: true, response };
  } catch (err: any) {
    logger.error('Groq API test execution failed:', {}, err);
    results.groq_test = { success: false, error: err.message || err.toString() };
  }

  return NextResponse.json(results);
}
