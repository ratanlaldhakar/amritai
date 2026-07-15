import './load-env';
import { db } from '../services/db';

async function run() {
  const conversations = await db.messages.getConversations();
  console.log('Conversations:');
  conversations.forEach((c) => {
    console.log(`Phone: ${c.phone_number} | AI Enabled: ${c.ai_enabled} | Status: ${c.status} | Handover: ${c.handover_reason}`);
  });
}
run();
