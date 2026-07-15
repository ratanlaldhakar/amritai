import fs from 'fs';
import path from 'path';

// Polyfill native WebSocket for Node 20 / @supabase/supabase-js realtime dependency
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class MockWebSocket {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

// Load and parse .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const splitIndex = trimmed.indexOf('=');
    if (splitIndex === -1) return;
    const key = trimmed.substring(0, splitIndex).trim();
    const val = trimmed.substring(splitIndex + 1).trim();
    process.env[key] = val;
  });
  console.log('Successfully loaded .env.local');
} catch (err) {
  console.error('Error loading .env.local:', err);
}

async function test() {
  console.log('Starting verification test for AI Receptionist Brain...');
  
  // Dynamically import aiBrainService after env variables are populated
  const { aiBrainService } = await import('../services/ai-brain');
  
  // Test 1: Hinglish timing query
  console.log('\n--- TEST 1: Class Timing Query (Hinglish) ---');
  const response1 = await aiBrainService.processIncomingMessage(
    '+919999999999',
    'Morning yoga batch kab se start hota h?',
    'Rahul'
  );
  console.log('User: "Morning yoga batch kab se start hota h?"');
  console.log('AI Receptionist Response:\n', response1);

  // Test 2: Hindi address query
  console.log('\n--- TEST 2: Address Query (Hindi) ---');
  const response2 = await aiBrainService.processIncomingMessage(
    '+919999999999',
    'सेंटर का पता क्या है और गूगल मैप लोकेशन?',
    'Amit'
  );
  console.log('User: "सेंटर का पता क्या है और गूगल मैप लोकेशन?"');
  console.log('AI Receptionist Response:\n', response2);

  // Test 3: Low confidence/Out of knowledge base query (should trigger handover)
  console.log('\n--- TEST 3: Out of KB Query (Low Confidence -> Handover) ---');
  const response3 = await aiBrainService.processIncomingMessage(
    '+919999999999',
    'Do you sell organic honey or protein powder at the reception?',
    'Pooja'
  );
  console.log('User: "Do you sell organic honey or protein powder at the reception?"');
  console.log('AI Receptionist Response (Expected Handoff Phrase):\n', response3);
}

test().catch((err) => {
  console.error('Test execution error:', err);
});
