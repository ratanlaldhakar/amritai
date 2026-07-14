import { GoogleGenAI } from '@google/genai';
import { env } from './env';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL: Gemini client can only be used on the server side!');
}

export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export const GEMINI_MODELS = {
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
} as const;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

/**
 * Generate a text response using Gemini
 */
export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string,
  model: GeminiModel = GEMINI_MODELS.GEMINI_2_5_FLASH,
  temperature = 0.3
) {
  try {
    const response = await gemini.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
      },
    });

    return response.text || '';
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw error;
  }
}
