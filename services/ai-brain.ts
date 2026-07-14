import { generateGeminiText, GEMINI_MODELS } from '@/lib/gemini';
import { generateGroqText, GROQ_MODELS } from '@/lib/groq';
import { logger } from '@/lib/logger';
import { db } from '@/services/db';
import { memoryCache } from '@/utils/cache';
import { withRetry } from '@/utils/retry';
import {
  SYSTEM_INSTRUCTION,
  ChatMessageMemory,
  formatConversationHistory,
  formatKnowledgeBase,
  compileUserPrompt,
} from './prompt-builder';

export class AIBrainService {
  private fallbackPhrase = 'Our instructor will contact you shortly.';

  /**
   * Retrieve conversation memory from Supabase
   */
  async getMemory(phoneNumber: string, limit = 8): Promise<ChatMessageMemory[]> {
    try {
      const history = await db.messages.getHistory(phoneNumber, limit);
      return history.map((msg) => ({
        text: msg.text || '',
        direction: msg.direction as 'incoming' | 'outgoing',
        customerName: msg.customer_name || 'Customer',
      }));
    } catch (error) {
      logger.error('Database memory fetch exception:', { phoneNumber }, error);
      return [];
    }
  }

  /**
   * Retrieve knowledge base FAQs from Supabase (cached for 5m)
   */
  async getKnowledge(): Promise<{ title: string; content: string }[]> {
    try {
      const cached = memoryCache.get<{ title: string; content: string }[]>('knowledge_faqs');
      if (cached) {
        logger.info('Knowledge FAQ database fetched from MemoryCache cache');
        return cached;
      }

      const faqs = await db.faqs.getAll();
      const mapped = faqs.map((faq) => ({
        title: faq.question,
        content: faq.answer,
      }));

      // Cache for 5 minutes (300,000 ms)
      memoryCache.set('knowledge_faqs', mapped, 300000);
      return mapped;
    } catch (error) {
      logger.error('Database knowledge fetch exception:', {}, error);
      return [];
    }
  }

  private async queryLLM(prompt: string): Promise<string> {
    const configuredModel =
      (await db.settings.get<string>('primary_model')) || 'llama-3.3-70b-versatile';
    const temperature = (await db.settings.get<number>('temperature')) ?? 0.3;

    // Check if Groq is the primary model (starts with llama or mixtral)
    const isGroqPrimary = configuredModel.includes('llama') || configuredModel.includes('mixtral');

    if (isGroqPrimary) {
      // 1. Try Groq as Primary
      try {
        logger.info(`Querying Primary LLM (Groq): ${configuredModel}`);
        const response = await withRetry(
          () => generateGroqText(prompt, SYSTEM_INSTRUCTION, configuredModel as any, temperature),
          { retries: 2, delayMs: 300 }
        );

        if (response && response.trim().length > 0) {
          logger.info('Primary LLM (Groq) query completed successfully.');
          return response.trim();
        }
        throw new Error('Groq returned an empty response');
      } catch (groqError: any) {
        logger.warn('Primary LLM (Groq) query failed. Error Details:', {
          message: groqError?.message,
          stack: groqError?.stack,
        });

        // 2. Try Gemini as Fallback
        logger.info('Attempting Fallback LLM: Google Gemini 2.5 Flash');
        try {
          const isQuotaError = (err: any) => {
            const msg = String(err?.message || '').toLowerCase();
            return msg.includes('429') || msg.includes('resource_exhausted') || err?.status === 429;
          };

          const response = await withRetry(
            () =>
              generateGeminiText(
                prompt,
                SYSTEM_INSTRUCTION,
                GEMINI_MODELS.GEMINI_2_5_FLASH,
                temperature
              ),
            {
              retries: 2,
              delayMs: 300,
              shouldRetry: (err) => !isQuotaError(err), // Instantly skip retries on 429 quota exhaustion
            }
          );

          if (response && response.trim().length > 0) {
            logger.info('Fallback LLM (Gemini) query completed successfully.');
            return response.trim();
          }
          throw new Error('Gemini returned an empty response');
        } catch (geminiError: any) {
          logger.error('Both Primary (Groq) and Fallback (Gemini) LLMs failed to respond.', {
            geminiError: {
              message: geminiError?.message,
              stack: geminiError?.stack,
            },
          });
          throw new Error('LLM generation failed completely');
        }
      }
    } else {
      // 1. Try Gemini as Primary
      try {
        logger.info(`Querying Primary LLM (Gemini): ${configuredModel}`);

        const isQuotaError = (err: any) => {
          const msg = String(err?.message || '').toLowerCase();
          return msg.includes('429') || msg.includes('resource_exhausted') || err?.status === 429;
        };

        const response = await withRetry(
          () => generateGeminiText(prompt, SYSTEM_INSTRUCTION, configuredModel as any, temperature),
          {
            retries: 2,
            delayMs: 300,
            shouldRetry: (err) => !isQuotaError(err), // Instantly skip retries on 429 quota exhaustion
          }
        );

        if (response && response.trim().length > 0) {
          logger.info('Primary LLM (Gemini) query completed successfully.');
          return response.trim();
        }
        throw new Error('Gemini returned an empty response');
      } catch (geminiError: any) {
        logger.warn('Primary LLM (Gemini) query failed. Error Details:', {
          message: geminiError?.message,
          stack: geminiError?.stack,
        });

        // 2. Try Groq as Fallback
        const fallbackModel = GROQ_MODELS.LLAMA_3_3_70B;
        logger.info(`Attempting Fallback LLM (Groq): ${fallbackModel}`);
        try {
          const response = await withRetry(
            () => generateGroqText(prompt, SYSTEM_INSTRUCTION, fallbackModel, temperature),
            { retries: 2, delayMs: 300 }
          );

          if (response && response.trim().length > 0) {
            logger.info('Fallback LLM (Groq) query completed successfully.');
            return response.trim();
          }
          throw new Error('Groq returned an empty response');
        } catch (groqError: any) {
          logger.error('Both Primary (Gemini) and Fallback (Groq) LLMs failed to respond.', {
            groqError: {
              message: groqError?.message,
              stack: groqError?.stack,
            },
          });
          throw new Error('LLM generation failed completely');
        }
      }
    }
  }

  /**
   * Validate and clean AI response to guarantee strict handoff policies
   */
  private validateResponse(aiResponse: string): string {
    const cleaned = aiResponse.trim();

    if (!cleaned) {
      logger.warn('AI Response Validation triggered Fallback: Response is completely empty');
      return this.fallbackPhrase;
    }

    // Only fallback if the model explicitly requested or contains instructor contact sentence
    if (cleaned.toLowerCase().includes('instructor will contact')) {
      logger.info(
        'AI Response Validation triggered Fallback: Response explicitly mentioned instructor contact'
      );
      return this.fallbackPhrase;
    }

    return cleaned;
  }

  /**
   * Save outgoing AI receptionist message to Supabase
   */
  private async saveOutgoingMessage(
    phoneNumber: string,
    customerName: string,
    responseText: string
  ): Promise<void> {
    try {
      const timestamp = new Date();
      const mockWamid = `wamid.outgoing.${timestamp.getTime()}`;

      await db.messages.save({
        message_id: mockWamid,
        phone_number: phoneNumber,
        customer_name: customerName,
        text: responseText,
        direction: 'outgoing',
        whatsapp_timestamp: timestamp.toISOString(),
      });
    } catch (error) {
      logger.error('Supabase outgoing save exception:', { phoneNumber }, error);
    }
  }

  /**
   * Main entry pipeline to process client message and generate receptionist reply
   */
  async processIncomingMessage(
    phoneNumber: string,
    messageText: string,
    customerName: string
  ): Promise<string> {
    logger.info(`AI Brain processing request for: ${phoneNumber} (${customerName})`);

    // Precheck: Stop AI and create human ticket immediately if handover keywords matched
    const lowerMessage = messageText.toLowerCase();
    const handoverKeywords = ['teacher', 'call', 'refund', 'complaint', 'human', 'support'];
    const hasHandoverKeyword = handoverKeywords.some((keyword) => lowerMessage.includes(keyword));

    if (hasHandoverKeyword) {
      logger.info('Immediate human handover triggered by message content keywords', {
        messageText,
      });
      try {
        await db.inquiries.create({
          phone_number: phoneNumber,
          customer_name: customerName,
          message: `${messageText} (Immediate keyword handoff trigger)`,
          assigned_to: null,
        });
        await db.students.updateStatus(phoneNumber, 'lead');
        logger.info(`Successfully logged handoff inquiry in database for ${phoneNumber}`);
      } catch (dbErr) {
        logger.error('Failed to log handoff inquiry in database:', {}, dbErr);
      }

      const finalResponse = this.fallbackPhrase;
      await this.saveOutgoingMessage(phoneNumber, customerName, finalResponse);
      return finalResponse;
    }

    // 1. Fetch memory and knowledge base in parallel
    const [history, kbItems] = await Promise.all([
      this.getMemory(phoneNumber),
      this.getKnowledge(),
    ]);

    // 2. Format inputs
    const historyStr = formatConversationHistory(history);
    const knowledgeBaseStr = formatKnowledgeBase(kbItems);

    // 3. Compile prompt
    const prompt = compileUserPrompt(knowledgeBaseStr, historyStr, messageText, customerName);
    logger.info('AI PROMPT COMPILED:', {
      phoneNumber,
      customerName,
      promptText: prompt,
    });

    // 4. Generate response
    let rawResponse: string;
    try {
      rawResponse = await this.queryLLM(prompt);
      logger.info('AI RAW RESPONSE RECEIVED:', {
        phoneNumber,
        rawResponse,
      });
    } catch (error: any) {
      logger.error('Critical AI Brain LLM Failure. Using fallback handoff.', {
        error: {
          message: error?.message,
          stack: error?.stack,
        },
      });
      rawResponse = this.fallbackPhrase;
    }

    // 5. Validate & apply strict handoff formatting
    let finalResponse = this.validateResponse(rawResponse);
    const isHandoff = finalResponse === this.fallbackPhrase;

    // Action Tags Regex parsers
    const bookTrialRegex =
      /\[ACTION:\s*BOOK_TRIAL\s*\|\s*Name:\s*([^|]+)\|\s*Age:\s*([^|]+)\|\s*Batch:\s*([^\]]+)\]/i;
    const handoverRegex = /\[ACTION:\s*HUMAN_HANDOVER\s*\|\s*Reason:\s*([^\]]+)\]/i;

    const bookTrialMatch = finalResponse.match(bookTrialRegex);
    const handoverMatch = finalResponse.match(handoverRegex);

    if (bookTrialMatch) {
      const name = bookTrialMatch[1].trim();
      const age = bookTrialMatch[2].trim();
      const batch = bookTrialMatch[3].trim();

      logger.info('Action parsed from LLM: BOOK_TRIAL', { name, age, batch });

      let resolvedBatchId: string | null = null;
      try {
        let batches = memoryCache.get<any[]>('studio_batches');
        if (!batches) {
          batches = await db.batches.getAll();
          memoryCache.set('studio_batches', batches, 300000);
        }
        const matched = batches.find((b) => b.name.toLowerCase().includes(batch.toLowerCase()));
        if (matched) {
          resolvedBatchId = matched.id;
        }
      } catch (err) {
        logger.error('Error resolving batch ID for booking:', {}, err);
      }

      try {
        await db.students.upsert({
          phone_number: phoneNumber,
          name: name,
          status: 'trial_booked',
          trial_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Set tomorrow
          batch_id: resolvedBatchId,
          notes: `Age: ${age}. Preferred batch: ${batch}. (Trial class booked automatically by AI Receptionist)`,
        });
        logger.info(`Successfully stored trial booking in database for ${phoneNumber}`);
      } catch (dbErr) {
        logger.error('Failed to save trial booking in database:', {}, dbErr);
      }

      // Strip tag
      finalResponse = finalResponse.replace(bookTrialRegex, '').trim();
    } else if (handoverMatch || isHandoff) {
      const reason = handoverMatch
        ? handoverMatch[1].trim()
        : 'Unspecified query uncertainty or manual handoff trigger';
      logger.info('Action parsed from LLM: HUMAN_HANDOVER', { reason });

      try {
        await db.inquiries.create({
          phone_number: phoneNumber,
          customer_name: customerName,
          message: `${messageText} (Handoff trigger reason: ${reason})`,
          assigned_to: null,
        });
        await db.students.updateStatus(phoneNumber, 'lead');
        logger.info(`Successfully logged handoff inquiry in database for ${phoneNumber}`);
      } catch (dbErr) {
        logger.error('Failed to log handoff inquiry in database:', {}, dbErr);
      }

      finalResponse = this.fallbackPhrase;
    } else {
      // Normal flow: Upsert student as general lead
      try {
        await db.students.upsert({
          phone_number: phoneNumber,
          name: customerName,
          status: 'lead',
          trial_date: null,
          batch_id: null,
          notes: `Last user query: "${messageText.slice(0, 60)}..."`,
        });
      } catch (dbErr) {
        logger.error('Failed to upsert student lead profile:', {}, dbErr);
      }
    }

    // 6. Save outgoing message to database
    await this.saveOutgoingMessage(phoneNumber, customerName, finalResponse);

    logger.info('AI Brain generated response:', { finalResponse });
    return finalResponse;
  }
}

export const aiBrainService = new AIBrainService();
export default aiBrainService;
