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
      return history.map((msg) => {
        let text = msg.text || '';
        
        // Clean LLM meta-instructions from outgoing messages to prevent loop confusion
        if (msg.direction === 'outgoing') {
          text = text
            .replace(/\[WAITING FOR RESPONSE\]/gi, '')
            .replace(/\(Please respond with[^)]*\)/gi, '')
            .replace(/\[ACTION:[^\]]*\]/gi, '')
            .trim();
        }
        
        return {
          text,
          direction: msg.direction as 'incoming' | 'outgoing',
          customerName: 'Customer',
        };
      });
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
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      { provider: 'groq', model: 'llama-3.1-8b-instant' },
      { provider: 'groq', model: 'mixtral-8x7b-32768' },
      { provider: 'groq', model: 'llama-3.1-70b-versatile' },
      { provider: 'groq', model: 'gemma2-9b-it' },
      { provider: 'gemini', model: GEMINI_MODELS.GEMINI_2_5_FLASH },
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
    let cleaned = aiResponse.trim();

    if (!cleaned) {
      logger.warn('AI Response Validation triggered Fallback: Response is completely empty');
      return this.fallbackPhrase;
    }

    // Strip LLM meta-instructions that should never reach the customer
    cleaned = cleaned
      .replace(/\[WAITING FOR RESPONSE\]/gi, '')
      .replace(/\(Please respond with[^)]*\)/gi, '')
      .trim();

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

    // Precheck: Stop AI and create human ticket immediately if handover keywords matched as whole words
    const lowerMessage = messageText.toLowerCase();
    const handoverKeywords = ['teacher', 'call', 'refund', 'complaint', 'human', 'support'];
    const hasHandoverKeyword = handoverKeywords.some((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(lowerMessage);
    });

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

    // ── PROGRAMMATIC SLOT EXTRACTION ──
    // Scan conversation history + current message for trial booking slots.
    // If all 3 slots (Name, Age, Batch) are detected, skip the LLM entirely and auto-book.
    const allIncomingTexts = history
      .filter((m) => m.direction === 'incoming')
      .map((m) => m.text)
      .concat([messageText]);
    const combinedIncoming = allIncomingTexts.join(' | ');

    // Check if conversation context implies trial booking intent
    const allTexts = history.map((m) => m.text).concat([messageText]);
    const combinedAll = allTexts.join(' ').toLowerCase();
    const hasTrialIntent =
      combinedAll.includes('trial') ||
      combinedAll.includes('book') ||
      combinedAll.includes('join') ||
      combinedAll.includes('class') ||
      combinedAll.includes('register') ||
      combinedAll.includes('confirm');

    if (hasTrialIntent) {
      // Extract age: any standalone number between 3 and 120
      let detectedAge: string | null = null;
      for (const txt of allIncomingTexts) {
        const ageMatch = txt.match(/\b(\d{1,3})\b/);
        if (ageMatch) {
          const num = parseInt(ageMatch[1]);
          if (num >= 3 && num <= 120) detectedAge = String(num);
        }
      }

      // Extract batch: morning or evening
      let detectedBatch: string | null = null;
      if (/\bmorning\b/i.test(combinedIncoming)) detectedBatch = 'Morning';
      else if (/\bevening\b/i.test(combinedIncoming)) detectedBatch = 'Evening';
      else if (/\bsubah\b/i.test(combinedIncoming)) detectedBatch = 'Morning';
      else if (/\bsham\b/i.test(combinedIncoming)) detectedBatch = 'Evening';

      // Extract name: use customerName from WhatsApp profile, or look for name patterns
      let detectedName: string | null = null;
      // Check if any incoming message looks like a name (2-30 alpha chars, no numbers)
      for (const txt of allIncomingTexts) {
        const trimmed = txt.trim();
        // Pure name: only letters and spaces, 2-30 chars, not a known keyword
        if (/^[a-zA-Z\s]{2,30}$/.test(trimmed)) {
          const lower = trimmed.toLowerCase();
          const skipWords = ['morning', 'evening', 'hi', 'hello', 'hy', 'hii', 'yes', 'no', 'ok', 'confirm', 'book', 'join', 'class', 'trial', 'haan', 'nahi'];
          if (!skipWords.includes(lower)) {
            detectedName = trimmed;
          }
        }
      }
      // Fallback: try to extract from comma-separated format like "Vasu,99,morning"
      if (!detectedName) {
        for (const txt of allIncomingTexts) {
          const commaMatch = txt.match(/^([a-zA-Z]+)\s*[,]\s*(\d{1,3})\s*[,]/i);
          if (commaMatch) {
            detectedName = commaMatch[1].trim();
            const ageNum = parseInt(commaMatch[2]);
            if (ageNum >= 3 && ageNum <= 120) detectedAge = String(ageNum);
          }
        }
      }
      // Ultimate fallback: use WhatsApp profile name if it's not just emoji
      if (!detectedName && customerName && /[a-zA-Z]/.test(customerName)) {
        detectedName = customerName;
      }

      // If all 3 slots are filled, AUTO-BOOK without LLM!
      if (detectedName && detectedAge && detectedBatch) {
        logger.info('PROGRAMMATIC SLOT EXTRACTION: All 3 trial booking slots detected!', {
          name: detectedName, age: detectedAge, batch: detectedBatch,
        });

        // Create trial booking
        try {
          await db.trial_bookings.create({
            name: detectedName,
            phone: canonicalPhone,
            age: parseInt(detectedAge) || null,
            gender: null, city: null,
            batch: detectedBatch,
            goal: null,
            notes: `Trial class booked automatically by AI Receptionist (slot extraction). Preferred batch: ${detectedBatch}.`,
            status: 'pending',
            mode: 'Offline',
            experience: null,
            source: 'WhatsApp AI',
          });
          logger.info(`Auto-booked trial for ${detectedName} (${canonicalPhone})`);
        } catch (dbErr) {
          logger.error('Failed to auto-book trial:', {}, dbErr);
        }

        // Upsert CRM lead
        try {
          await db.leads.upsert({
            phone_number: canonicalPhone,
            name: detectedName,
            status: 'trial_booked',
            interest: 'Trial Booking',
            preferred_batch: detectedBatch,
            goal: null,
            source: 'WhatsApp',
            notes: `Age: ${detectedAge}. Batch: ${detectedBatch}. Auto-booked via slot extraction.`,
            follow_up_date: null,
          });
        } catch (dbErr) {
          logger.error('Failed to upsert CRM lead for auto-booking:', {}, dbErr);
        }

        const confirmMsg = `Hari Om! 🙏 ${detectedName} ji, aapki trial class successfully book ho gayi hai! ✅\n\n📋 Booking Details:\n• Name: ${detectedName}\n• Age: ${detectedAge}\n• Batch: ${detectedBatch} (6:00 AM - 7:00 AM)\n\n📍 Location: 3-M-7, 2nd Floor, Near Vinay Stationers, Government Hospital Road, Bapunagar, Bhilwara (Rajasthan)\n\nHum aapka intezaar karenge! Agar koi sawal ho toh yahan puchh sakte hain. 🙏`;
        await this.saveOutgoingMessage(canonicalPhone, customerName, confirmMsg);
        return confirmMsg;
      }
    }

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
