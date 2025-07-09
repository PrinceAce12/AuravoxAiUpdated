-- Fix RLS policies for webhook_settings table
-- Option 1: Temporarily disable RLS for webhook settings (uncomment if needed)
-- ALTER TABLE public.webhook_settings DISABLE ROW LEVEL SECURITY;

-- Option 2: Create more permissive policies (recommended)
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can insert webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can update webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can delete webhook settings" ON public.webhook_settings;

-- Create a single permissive policy for all operations
CREATE POLICY "Allow all webhook settings operations" ON public.webhook_settings
    FOR ALL USING (true);

-- Alternative: Create specific policies for each operation
-- CREATE POLICY "Allow webhook settings select" ON public.webhook_settings FOR SELECT USING (true);
-- CREATE POLICY "Allow webhook settings insert" ON public.webhook_settings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow webhook settings update" ON public.webhook_settings FOR UPDATE USING (true);
-- CREATE POLICY "Allow webhook settings delete" ON public.webhook_settings FOR DELETE USING (true);

-- Ensure the table has at least one record
INSERT INTO public.webhook_settings (webhook_url, is_active)
VALUES (NULL, true)
ON CONFLICT DO NOTHING; 