-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================================
-- 1. ADMINS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'instructor', 'coordinator')) DEFAULT 'coordinator',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers & Indexes for Admins
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 2. BATCHES TABLE (Yoga Classes timings/slots)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                  -- e.g., 'Morning Hatha Flow'
    start_time TIME NOT NULL,            -- e.g., '06:00:00'
    end_time TIME NOT NULL,              -- e.g., '07:30:00'
    days TEXT[] NOT NULL,                -- e.g., ['Monday', 'Tuesday', 'Wednesday']
    instructor TEXT,
    capacity INT DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers & Indexes for Batches
CREATE INDEX IF NOT EXISTS idx_batches_time ON public.batches(start_time, end_time);
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 3. STUDENTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,    -- WhatsApp number (E.164 formatting recommended)
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('lead', 'trial_booked', 'active', 'inactive')) DEFAULT 'lead',
    trial_date TIMESTAMPTZ,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers & Indexes for Students
CREATE INDEX IF NOT EXISTS idx_students_phone_number ON public.students(phone_number);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON public.students(batch_id);
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 4. FAQS TABLE (Replaces older yoga_knowledge FAQs)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,              -- e.g., 'pricing', 'schedule', 'general'
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers & Indexes for FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 5. MESSAGES TABLE (WhatsApp transcripts: incoming & outgoing)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT UNIQUE NOT NULL,     -- WhatsApp wamid
    phone_number TEXT NOT NULL,          -- Sender phone number
    customer_name TEXT,                  -- WhatsApp display profile name
    text TEXT NOT NULL,                  -- Text details
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    whatsapp_timestamp TIMESTAMPTZ NOT NULL, -- Timestamp parsed from Meta payload
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Messages
CREATE INDEX IF NOT EXISTS idx_messages_phone ON public.messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_wamid ON public.messages(message_id);

-- =========================================================================
-- 6. INQUIRIES TABLE (Leads/Handoff escalations)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    customer_name TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'ignored')) DEFAULT 'pending',
    assigned_to UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers & Indexes for Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON public.inquiries(phone_number);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 7. SETTINGS TABLE (Config key-values)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,            -- e.g. 'ai_model', 'receptionist_prompt'
    value JSONB NOT NULL,                -- Configuration JSON values
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers for Settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Default Policies:
-- Allow the service_role key (which is used in Next.js Server Actions / API routes)
-- to bypass RLS automatically. So we do not need public policies for our backend.
-- We add standard authenticated policies to allow dashboard/admin access later:

CREATE POLICY admin_all_admins ON public.admins TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_batches ON public.batches TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_students ON public.students TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_faqs ON public.faqs TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_messages ON public.messages TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_inquiries ON public.inquiries TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_settings ON public.settings TO authenticated USING (true) WITH CHECK (true);
