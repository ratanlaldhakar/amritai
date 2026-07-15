import { RECEPTIONIST_SYSTEM_PROMPT } from '@/lib/constants';

export const SYSTEM_INSTRUCTION = RECEPTIONIST_SYSTEM_PROMPT;

export interface ChatMessageMemory {
  text: string;
  direction: 'incoming' | 'outgoing';
  customerName: string;
}

/**
 * Format conversation memory logs into a chat log script for the LLM
 */
export function formatConversationHistory(history: ChatMessageMemory[]): string {
  if (history.length === 0) {
    return 'No previous conversation history.';
  }

  return history
    .map((msg) => {
      const sender = msg.direction === 'incoming' ? msg.customerName : 'Amrit Yoga Receptionist';
      return `${sender}: ${msg.text}`;
    })
    .join('\n');
}

/**
 * Format database knowledge blocks into a structured context string
 */
export function formatKnowledgeBase(kbItems: { title: string; content: string }[]): string {
  if (kbItems.length === 0) {
    return 'No knowledge base items available.';
  }

  return kbItems
    .map((item, index) => {
      return `[Knowledge Block #${index + 1}]
Topic: ${item.title}
Information: ${item.content}`;
    })
    .join('\n\n');
}

/**
 * Compile the final user prompt body to feed into the model
 */
export function compileUserPrompt(
  knowledgeBaseStr: string,
  historyStr: string,
  currentMessage: string,
  customerName: string
): string {
  return `
You are the AI Receptionist. You must follow the SYSTEM INSTRUCTION persona.
Below is the verified knowledge base and history. Do not guess.

--- KNOWLEDGE BASE ---
${knowledgeBaseStr}

--- CONVERSATION HISTORY ---
${historyStr}

--- INCOMING MESSAGE ---
Customer Name: ${customerName}
Message: ${currentMessage}

--- STAGE INSTRUCTION ---
Read the CONVERSATION HISTORY carefully to check if the client has already provided their Name, Age, and Preferred Batch (Morning/Evening).
1. If they have already provided their Name, Age, and Preferred Batch, do NOT ask for them again. Immediately output the booking tag at the end of your response:
   [ACTION: BOOK_TRIAL | Name: (Name) | Age: (Age) | Batch: (Batch)]
2. If any detail is missing, ask for it politely. Do not ask for details they have already given.

--- YOUR RESPONSE ---
`;
}
