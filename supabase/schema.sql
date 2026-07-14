-- Create WhatsApp messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT UNIQUE NOT NULL,         -- WhatsApp unique message ID (wamid)
    phone_number TEXT NOT NULL,              -- Customer phone number
    customer_name TEXT,                      -- Customer WhatsApp profile name
    text TEXT,                               -- Message content
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    whatsapp_timestamp TIMESTAMPTZ NOT NULL, -- Timestamp from Meta API
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON public.whatsapp_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_number ON public.whatsapp_messages(phone_number);

-- Enable Row Level Security (RLS)
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- By default, enabling RLS without policies denies all public/anonymous client-side access,
-- while allowing the service-role client (used by our Next.js backend) to perform full operations.
