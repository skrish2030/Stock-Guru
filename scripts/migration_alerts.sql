-- SQL MIGRATION FOR PROJECT ALERTSHIELD
-- Paste this script into your Supabase SQL Editor and run it.

-- 1. Create table for alert configurations
CREATE TABLE IF NOT EXISTS public.user_alert_settings (
    email TEXT PRIMARY KEY,
    morning_briefing BOOLEAN DEFAULT true,
    day_end_report BOOLEAN DEFAULT true,
    trend_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for tracking user stock holdings
CREATE TABLE IF NOT EXISTS public.user_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT REFERENCES public.user_alert_settings(email) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    shares NUMERIC NOT NULL,
    avg_cost NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS (Row Level Security) and configure public access
ALTER TABLE public.user_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

-- Disable restrict rules for public testing
DROP POLICY IF EXISTS "Public Select settings" ON public.user_alert_settings;
CREATE POLICY "Public Select settings" ON public.user_alert_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert settings" ON public.user_alert_settings;
CREATE POLICY "Public Insert settings" ON public.user_alert_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update settings" ON public.user_alert_settings;
CREATE POLICY "Public Update settings" ON public.user_alert_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Select portfolio" ON public.user_portfolio;
CREATE POLICY "Public Select portfolio" ON public.user_portfolio FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert portfolio" ON public.user_portfolio;
CREATE POLICY "Public Insert portfolio" ON public.user_portfolio FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete portfolio" ON public.user_portfolio;
CREATE POLICY "Public Delete portfolio" ON public.user_portfolio FOR DELETE USING (true);
