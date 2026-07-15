-- ============================================================
-- YOGAMRIT CERTIFICATE SYSTEM INTEGRATION — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  dob DATE,
  course_name TEXT NOT NULL,
  course_category TEXT,
  certificate_type TEXT DEFAULT 'completion' CHECK (certificate_type IN ('completion', 'achievement', 'excellence')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  grade TEXT,
  instructor_name TEXT DEFAULT 'Suresh Kumar',
  remarks TEXT,
  signature_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Certificate Counters (for auto-increment)
CREATE TABLE IF NOT EXISTS certificate_counters (
  year INTEGER PRIMARY KEY,
  last_number INTEGER DEFAULT 0
);

-- 3. Atomic Certificate ID Generator Function (YM-YYYY-XXXX)
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  next_num INTEGER;
  cert_id TEXT;
BEGIN
  INSERT INTO certificate_counters (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_number = certificate_counters.last_number + 1
  RETURNING last_number INTO next_num;

  cert_id := 'YM-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN cert_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Certificate Settings Table (stores digital seals and default settings)
CREATE TABLE IF NOT EXISTS certificate_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  seal_url TEXT,
  signature_url TEXT,
  instructor_name TEXT DEFAULT 'Suresh Kumar',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize settings row
INSERT INTO certificate_settings (id, instructor_name)
VALUES (1, 'Suresh Kumar')
ON CONFLICT (id) DO NOTHING;

-- 5. Revoked Certificates Log Table
CREATE TABLE IF NOT EXISTS revoked_certificates (
  id UUID REFERENCES certificates(id) ON DELETE CASCADE PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,
  revoke_reason TEXT NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Profiles Table (links Supabase Auth users to roles)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Indexes for Search Optimization
CREATE INDEX IF NOT EXISTS idx_certs_mobile ON certificates(mobile_number);
CREATE INDEX IF NOT EXISTS idx_certs_cert_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certs_status ON certificates(status);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Public RLS Policies
-- Public can view certificates to search/verify
CREATE POLICY "Public can view certificates"
  ON certificates FOR SELECT
  USING (true);

-- Public can view certificate settings (needed for displaying signature/seal)
CREATE POLICY "Public can view settings"
  ON certificate_settings FOR SELECT
  USING (true);

-- Public can view revoked log (needed for verification page)
CREATE POLICY "Public can view revoked logs"
  ON revoked_certificates FOR SELECT
  USING (true);

-- Users can read their own admin profiles
CREATE POLICY "Users can read own profile"
  ON admin_profiles FOR SELECT
  USING (id = auth.uid());

-- 10. Admin RLS Policies (Full CRUD restricted to users in admin_profiles)
CREATE POLICY "Admins can insert certificates"
  ON certificates FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update certificates"
  ON certificates FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete certificates"
  ON certificates FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

-- Settings Admin Policies
CREATE POLICY "Admins can manage settings"
  ON certificate_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

-- Revocation Admin Policies
CREATE POLICY "Admins can manage revoked logs"
  ON revoked_certificates FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

-- Counters Admin Policies
ALTER TABLE certificate_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage counters"
  ON certificate_counters FOR ALL
  USING (exists (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

-- ============================================================
-- 11. Seeding Default Admin Account (admin@yogamrit.com)
-- Password: Admin123!
-- ============================================================
DO $$
DECLARE
  hashed_password TEXT;
  admin_id UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
BEGIN
  -- Try generating salt using extensions or public schema
  BEGIN
    hashed_password := extensions.crypt('Admin123!', extensions.gen_salt('bf'));
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      hashed_password := public.crypt('Admin123!', public.gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
      -- Fallback to a pre-computed blowfish hash of "Admin123!"
      hashed_password := '$2a$10$wH2a1qM6m4a8eQ22k8J6a.jT0pD8tO2lP6Q0A7sP3k9yE0xH1wL.q';
    END;
  END;

  -- Insert Auth User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@yogamrit.com',
    hashed_password,
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Admin User"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Link profile in admin_profiles
  INSERT INTO public.admin_profiles (id, display_name, role)
  VALUES (admin_id, 'Admin User', 'superadmin')
  ON CONFLICT (id) DO NOTHING;
END $$;


-- ============================================================
-- 12. Gallery Table Upgrades (Display Order, Featured, Visible)
-- ============================================================
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;

-- ============================================================
-- 13. Gallery Category Limits (Move from localStorage to Supabase)
-- ============================================================
ALTER TABLE public.homepage ADD COLUMN IF NOT EXISTS gallery_category_limits TEXT DEFAULT '{}';

-- ============================================================
-- 14. Free Trial Bookings upgrades (Class Mode, Experience Level, Source)
-- ============================================================
ALTER TABLE public.trial_bookings ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.trial_bookings ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.trial_bookings ADD COLUMN IF NOT EXISTS source TEXT;

