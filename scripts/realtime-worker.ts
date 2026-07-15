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
  if (fs.existsSync(envPath)) {
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
    console.log('Worker loaded environment from .env.local');
  }
} catch (err) {
  console.error('Error loading .env.local in worker:', err);
}

// Initialize Supabase Client
import { createClient } from '@supabase/supabase-js';
import { db, normalizePhoneNumber } from '../services/db';
import { whatsAppClient } from '../lib/whatsapp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Worker exiting.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log(`Supabase Realtime Worker started for: ${supabaseUrl}`);

// Subscribe to trial_bookings INSERT events
const trialBookingsChannel = supabase
  .channel('shared-trial-bookings-insert')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'trial_bookings',
    },
    async (payload) => {
      console.log('🔔 New trial booking detected:', payload.new);
      const booking = payload.new;
      const canonicalPhone = normalizePhoneNumber(booking.phone);
      
      console.log(`Normalizing booking phone: ${booking.phone} -> ${canonicalPhone}`);
      
      // Update CRM lead
      try {
        await db.leads.upsert({
          phone_number: canonicalPhone,
          name: booking.name,
          status: 'trial_booked',
          interest: booking.batch || 'Trial Booking',
          preferred_batch: booking.batch,
          goal: booking.goal,
          source: booking.source || 'Website',
          city: booking.city,
          notes: `Trial booking created from website form. Experience: ${booking.experience || 'N/A'}. Notes: ${booking.notes || 'None'}`,
          follow_up_date: null
        });
        console.log(`CRM Lead upserted for ${canonicalPhone}`);
      } catch (err) {
        console.error('Failed to upsert lead in Realtime worker:', err);
      }

      // Send WhatsApp confirmation
      try {
        console.log(`Sending WhatsApp confirmation to ${canonicalPhone}...`);
        
        // We attempt template confirmation (Meta standard)
        try {
          await whatsAppClient.sendTemplate({
            to: canonicalPhone,
            templateName: 'trial_booking_confirm',
            languageCode: 'en_US',
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: booking.name },
                  { type: 'text', text: booking.batch || 'preferred batch' }
                ]
              }
            ]
          });
          console.log(`Template confirmation sent successfully to ${canonicalPhone}`);
        } catch (templateErr: any) {
          console.warn('WhatsApp template failed, falling back to direct text confirmation:', templateErr.message);
          
          // Fallback to text message
          const confirmationText = `Hari Om! 🙏 ${booking.name} ji,\n\nWe have received your trial class booking for the *${booking.batch || 'scheduled'}* batch.\n\n📍 *Location:* 3-M-7, 2nd Floor, Near Vinay Stationers, Government Hospital Road, Bapunagar, Bhilwara.\n\nOur instructor Suresh Kumar ji will see you at the center. Please bring a yoga mat and arrive 5 minutes early. Thank you!`;
          
          await whatsAppClient.sendText({
            to: canonicalPhone,
            text: confirmationText
          });
          console.log(`Text confirmation sent successfully to ${canonicalPhone}`);
        }

        // Save confirmation message in chat logs
        await db.messages.save({
          message_id: `wamid.booking-confirm.${Date.now()}`,
          phone_number: canonicalPhone,
          customer_name: booking.name,
          text: `[Automated Confirmation Sent] Trial booking received for batch: ${booking.batch}`,
          direction: 'outgoing',
          whatsapp_timestamp: new Date().toISOString()
        });
        
      } catch (waErr) {
        console.error('Failed to send WhatsApp confirmation:', waErr);
      }
    }
  )
  .subscribe((status) => {
    console.log(`Realtime channel status for trial_bookings: ${status}`);
  });

// Keep process alive
process.on('SIGINT', () => {
  console.log('Worker shutting down.');
  process.exit(0);
});
