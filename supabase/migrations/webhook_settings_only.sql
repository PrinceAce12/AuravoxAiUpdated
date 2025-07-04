-- Create webhook_settings table for storing webhook URLs and configuration
CREATE TABLE IF NOT EXISTS public.webhook_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can insert webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can update webhook settings" ON public.webhook_settings;
DROP POLICY IF EXISTS "Authenticated users can delete webhook settings" ON public.webhook_settings;

-- Create more permissive policies for webhook settings
-- Allow service role to perform all operations
CREATE POLICY "Service role can manage webhook settings" ON public.webhook_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view webhook settings
CREATE POLICY "Authenticated users can view webhook settings" ON public.webhook_settings
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to insert webhook settings
CREATE POLICY "Authenticated users can insert webhook settings" ON public.webhook_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to update webhook settings
CREATE POLICY "Authenticated users can update webhook settings" ON public.webhook_settings
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to delete webhook settings
CREATE POLICY "Authenticated users can delete webhook settings" ON public.webhook_settings
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_webhook_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS on_webhook_settings_updated ON public.webhook_settings;
CREATE TRIGGER on_webhook_settings_updated
    BEFORE UPDATE ON public.webhook_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_webhook_settings_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS webhook_settings_is_active_idx ON public.webhook_settings(is_active);
CREATE INDEX IF NOT EXISTS webhook_settings_created_at_idx ON public.webhook_settings(created_at);

-- Insert a default webhook setting
INSERT INTO public.webhook_settings (webhook_url, is_active)
VALUES (NULL, true)
ON CONFLICT DO NOTHING; 