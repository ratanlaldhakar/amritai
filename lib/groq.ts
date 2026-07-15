import Groq from 'groq-sdk';
import { env } from './env';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL: Groq client can only be used on the server side!');
}

export const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export const GROQ_MODELS = {
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',
} as const;

export type GroqModel = string;

/**
 * Generate a text response using Groq completions
 */
export async function generateGroqText(
  prompt: string,
  systemInstruction?: string,
  model: GroqModel = GROQ_MODELS.LLAMA_3_3_70B,
  temperature = 0.3
) {
  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system' as const, content: systemInstruction });
    }
    messages.push({ role: 'user' as const, content: prompt });

    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating text with Groq:', error);
    throw error;
  }
}
export default groq;
