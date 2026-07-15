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

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const splitIndex = trimmed.indexOf('=');
      if (splitIndex === -1) return;
      const key = trimmed.substring(0, splitIndex).trim();
      const val = trimmed.substring(splitIndex + 1).trim();
      process.env[key] = val;
    });
  }
} catch (err) {
  console.error('Error loading env file:', err);
}
