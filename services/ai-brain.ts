import { generateGeminiText, GEMINI_MODELS } from '@/lib/gemini';
import { generateGroqText, GROQ_MODELS } from '@/lib/groq';
import { logger } from '@/lib/logger';
import { db, normalizePhoneNumber } from '@/services/db';
import { memoryCache } from '@/utils/cache';
import { withRetry } from '@/utils/retry';
import { getSupabaseServiceRole } from '@/lib/supabase';
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
      const canonical = normalizePhoneNumber(phoneNumber);
      const history = await db.messages.getHistory(canonical, limit);
      return history.map((msg) => ({
        text: msg.text || '',
        direction: msg.direction as 'incoming' | 'outgoing',
        customerName: 'Customer', // Simplified name fallback
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

      const kbItems = await db.knowledge_base.getAll();
      const mapped = kbItems.map((item) => ({
        title: item.question,
        content: item.answer,
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
    const temperature = (await db.settings.get<number>('temperature')) ?? 0.3;

    // Ordered queue of fallback models to try
    const modelQueue: { provider: 'groq' | 'gemini'; model: string }[] = [
      { provider: 'groq', model: GROQ_MODELS.LLAMA_3_3_70B },
      { provider: 'gemini', model: GEMINI_MODELS.GEMINI_2_5_FLASH },
      { provider: 'groq', model: GROQ_MODELS.LLAMA_3_1_8B },
      { provider: 'groq', model: GROQ_MODELS.MIXTRAL_8X7B },
    ];

    // If there is a primary model configured in settings, put it at the top of the queue
    try {
      const configuredModel = await db.settings.get<string>('primary_model');
      if (configuredModel) {
        const isGemini = configuredModel.includes('gemini');
        
        // Remove configured model from queue if it already exists there to prevent duplicates
        const idx = modelQueue.findIndex((m) => m.model === configuredModel);
        if (idx !== -1) {
          modelQueue.splice(idx, 1);
        }
        
        // Put the configured model first
        modelQueue.unshift({
          provider: isGemini ? 'gemini' : 'groq',
          model: configuredModel,
        });
      }
    } catch (configErr) {
      logger.warn('Failed to load primary model settings:', {}, configErr);
    }

    // Try each model in the queue until one succeeds
    for (const item of modelQueue) {
      try {
        logger.info(`Attempting LLM generation with [${item.provider}] model: ${item.model}`);

        let response: string | null = null;
        if (item.provider === 'groq') {
          response = await withRetry(
            () => generateGroqText(prompt, SYSTEM_INSTRUCTION, item.model as any, temperature),
            {
              retries: 1,
              delayMs: 200,
              shouldRetry: (err) => {
                const msg = String(err?.message || '').toLowerCase();
                // Do NOT retry on 429 rate limit error to switch to the next fallback model faster!
                return !msg.includes('429') && !msg.includes('rate') && err?.status !== 429;
              },
            }
          );
        } else {
          response = await withRetry(
            () => generateGeminiText(prompt, SYSTEM_INSTRUCTION, item.model as any, temperature),
            {
              retries: 1,
              delayMs: 200,
              shouldRetry: (err) => {
                const msg = String(err?.message || '').toLowerCase();
                // Do NOT retry on 429 rate limit or resource exhausted to switch immediately
                return !msg.includes('429') && !msg.includes('resource') && err?.status !== 429;
              },
            }
          );
        }

        if (response && response.trim().length > 0) {
          logger.info(`LLM generation succeeded with model: ${item.model}`);
          return response.trim();
        }
        throw new Error('LLM returned an empty response');
      } catch (modelErr: any) {
        logger.warn(`Model ${item.model} failed. Error: ${modelErr.message}. Trying next fallback model...`);
      }
    }

    throw new Error('All primary and fallback LLM models in queue failed to respond.');
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
      const canonical = normalizePhoneNumber(phoneNumber);
      const timestamp = new Date();
      const mockWamid = `wamid.outgoing.${timestamp.getTime()}`;

      await db.messages.save({
        message_id: mockWamid,
        phone_number: canonical,
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
    const canonicalPhone = normalizePhoneNumber(phoneNumber);
    logger.info(`AI Brain processing request for: ${canonicalPhone} (${customerName})`);

    // 0. Precheck: Verify if AI is disabled for this conversation thread
    try {
      const supabase = getSupabaseServiceRole();
      const { data: thread } = await supabase
        .from('conversation_threads')
        .select('ai_enabled')
        .eq('phone_number', canonicalPhone)
        .maybeSingle();
      if (thread && !thread.ai_enabled) {
        logger.info(`AI is disabled for thread ${canonicalPhone}, skipping bot response.`);
        return this.fallbackPhrase;
      }
    } catch (err) {
      logger.error('Failed to check thread ai_enabled status:', {}, err);
    }

    // Precheck: Stop AI and create human ticket immediately if handover keywords matched
    const lowerMessage = messageText.toLowerCase();
    const handoverKeywords = ['teacher', 'call', 'refund', 'complaint', 'human', 'support'];
    const hasHandoverKeyword = handoverKeywords.some((keyword) => lowerMessage.includes(keyword));

    if (hasHandoverKeyword) {
      logger.info('Immediate human handover triggered by message content keywords', {
        messageText,
      });
      try {
        await db.leads.upsert({
          phone_number: canonicalPhone,
          name: customerName,
          status: 'new',
          notes: `${messageText} (Immediate keyword handoff trigger)`,
          source: 'WhatsApp'
        });
        
        const supabase = getSupabaseServiceRole();
        await supabase
          .from('conversation_threads')
          .update({
            status: 'human_required',
            handover_reason: 'Keyword trigger',
            ai_enabled: false
          })
          .eq('phone_number', canonicalPhone);

        logger.info(`Successfully logged handoff inquiry in database for ${canonicalPhone}`);
      } catch (dbErr) {
        logger.error('Failed to log handoff inquiry in database:', {}, dbErr);
      }

      const finalResponse = this.fallbackPhrase;
      await this.saveOutgoingMessage(canonicalPhone, customerName, finalResponse);
      return finalResponse;
    }

    // 1. Fetch memory, knowledge base, and student status in parallel
    const [history, kbItems, studentProfile] = await Promise.all([
      this.getMemory(canonicalPhone),
      this.getKnowledge(),
      db.students.getByPhone(canonicalPhone),
    ]);

    // Customize prompt context if this is an enrolled active student
    let enrolledStatusContext = '';
    if (studentProfile && studentProfile.status === 'active') {
      enrolledStatusContext = `[Student Status: ENROLLED. Address them as an active practitioner of Amrit Yoga Center.]\n`;
    }

    // 2. Format inputs
    const historyStr = formatConversationHistory(history);
    const knowledgeBaseStr = formatKnowledgeBase(kbItems);

    // 3. Compile prompt
    const prompt = enrolledStatusContext + compileUserPrompt(knowledgeBaseStr, historyStr, messageText, customerName);
    logger.info('AI PROMPT COMPILED:', {
      canonicalPhone,
      customerName,
      promptText: prompt,
    });

    // 4. Generate response
    let rawResponse: string;
    try {
      rawResponse = await this.queryLLM(prompt);
      logger.info('AI RAW RESPONSE RECEIVED:', {
        canonicalPhone,
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

      // Create trial booking in the Website's trial_bookings table
      try {
        await db.trial_bookings.create({
          name: name,
          phone: canonicalPhone,
          age: parseInt(age) || null,
          gender: null,
          city: null,
          batch: batch,
          goal: null,
          notes: `Trial class booked automatically by AI Receptionist. Preferred batch: ${batch}.`,
          status: 'pending',
          mode: 'Offline',
          experience: null,
          source: 'WhatsApp AI'
        });
        logger.info(`Successfully stored trial booking in shared database for ${canonicalPhone}`);
      } catch (dbErr) {
        logger.error('Failed to save trial booking in shared database:', {}, dbErr);
      }

      // Upsert CRM lead with status 'trial_booked'
      try {
        await db.leads.upsert({
          phone_number: canonicalPhone,
          name: name,
          status: 'trial_booked',
          interest: 'Trial Booking',
          preferred_batch: batch,
          goal: null,
          source: 'WhatsApp',
          notes: `Age: ${age}. Preferred batch: ${batch}. Trial booked automatically.`,
          follow_up_date: null
        });
      } catch (dbErr) {
        logger.error('Failed to upsert CRM lead for trial booking:', {}, dbErr);
      }

      // Strip tag
      finalResponse = finalResponse.replace(bookTrialRegex, '').trim();
    } else if (handoverMatch || isHandoff) {
      const reason = handoverMatch
        ? handoverMatch[1].trim()
        : 'Unspecified query uncertainty or manual handoff trigger';
      logger.info('Action parsed from LLM: HUMAN_HANDOVER', { reason });

      try {
        await db.leads.upsert({
          phone_number: canonicalPhone,
          name: customerName,
          status: 'new',
          notes: `${messageText} (Handoff trigger reason: ${reason})`,
          source: 'WhatsApp'
        });

        const supabase = getSupabaseServiceRole();
        await supabase
          .from('conversation_threads')
          .update({
            status: 'human_required',
            handover_reason: reason,
            ai_enabled: false
          })
          .eq('phone_number', canonicalPhone);

        logger.info(`Successfully logged handoff CRM lead in database for ${canonicalPhone}`);
      } catch (dbErr) {
        logger.error('Failed to log handoff lead in database:', {}, dbErr);
      }

      finalResponse = this.fallbackPhrase;
    } else {
      // Normal flow: Upsert general CRM lead
      try {
        await db.leads.upsert({
          phone_number: canonicalPhone,
          name: customerName,
          status: 'new',
          notes: `Last user query: "${messageText.slice(0, 60)}..."`,
          source: 'WhatsApp'
        });
      } catch (dbErr) {
        logger.error('Failed to upsert CRM lead:', {}, dbErr);
      }
    }

    // 6. Save outgoing message to database
    await this.saveOutgoingMessage(canonicalPhone, customerName, finalResponse);

    logger.info('AI Brain generated response:', { finalResponse });
    return finalResponse;
  }
}

export const aiBrainService = new AIBrainService();
export default aiBrainService;
