-- Create yoga center knowledge base table
CREATE TABLE IF NOT EXISTS public.yoga_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,          -- e.g., 'classes', 'pricing', 'schedule', 'general'
    title TEXT NOT NULL,             -- topic or FAQ question
    content TEXT NOT NULL,           -- details or FAQ answer
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_yoga_knowledge_category ON public.yoga_knowledge(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.yoga_knowledge ENABLE ROW LEVEL SECURITY;

-- Seed FAQ values for the Raipur center
INSERT INTO public.yoga_knowledge (category, title, content) VALUES
('general', 'Location & Address', 'Amrit Yoga Center is located at E-168, Sector 2, Devendra Nagar, Raipur, Chhattisgarh 492004.'),
('general', 'Working Hours', 'Weekdays: 6:00 AM - 11:00 AM, 4:00 PM - 8:00 PM. Saturdays: 6:00 AM - 11:00 AM. Sundays: Closed.'),
('general', 'Contact Details', 'Phone: +91-XXXXX-XXXXX. Email: info@amrityogacenter.in. Website: https://amrityogacenter.in'),
('pricing', 'Membership Fees', 'Monthly Fee: ₹1,500. Quarterly (3 months): ₹4,000. Yearly: ₹12,000.'),
('classes', 'Hatha Yoga', 'Hatha Yoga focuses on breathing exercises (pranayama), body cleansing, and physical postures (asanas). Timings: Weekdays 6:00 AM - 7:30 AM and 5:30 PM - 7:00 PM.'),
('classes', 'Power Yoga', 'Power Yoga is a fitness-based, fast-paced vinyasa style class building core strength, flexibility, and stamina. Timings: Weekdays 7:30 AM - 8:30 AM and 7:00 PM - 8:00 PM.'),
('classes', 'Meditation & Pranayama', 'Focused sessions for breathing control techniques and guided mindfulness meditation to reduce stress. Timings: Saturdays 8:00 AM - 9:30 AM.'),
('trial', 'Trial Classes', 'Amrit Yoga Center offers one FREE trial class to new visitors. Advance registration is required via WhatsApp.'),
('policies', 'Class Guidelines', 'Practitioners are requested to wear comfortable clothing, bring their own yoga mats for hygiene, and avoid heavy meals at least 2 hours before the session.')
ON CONFLICT DO NOTHING;
