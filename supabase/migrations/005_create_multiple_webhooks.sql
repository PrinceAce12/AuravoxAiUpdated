-- Create webhooks table for storing multiple webhook URLs
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create webhook_assignments table to track which webhook is currently assigned
CREATE TABLE IF NOT EXISTS public.webhook_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can insert webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can update webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can delete webhooks" ON public.webhooks;

DROP POLICY IF EXISTS "Authenticated users can view webhook assignments" ON public.webhook_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert webhook assignments" ON public.webhook_assignments;
DROP POLICY IF EXISTS "Authenticated users can update webhook assignments" ON public.webhook_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete webhook assignments" ON public.webhook_assignments;

-- Create policies for webhooks table
CREATE POLICY "Service role can manage webhooks" ON public.webhooks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view webhooks" ON public.webhooks
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can insert webhooks" ON public.webhooks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can update webhooks" ON public.webhooks
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can delete webhooks" ON public.webhooks
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create policies for webhook_assignments table
CREATE POLICY "Service role can manage webhook assignments" ON public.webhook_assignments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view webhook assignments" ON public.webhook_assignments
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can insert webhook assignments" ON public.webhook_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can update webhook assignments" ON public.webhook_assignments
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can delete webhook assignments" ON public.webhook_assignments
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create function to update the updated_at timestamp for webhooks
CREATE OR REPLACE FUNCTION public.update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at timestamp for webhooks
DROP TRIGGER IF EXISTS on_webhooks_updated ON public.webhooks;
CREATE TRIGGER on_webhooks_updated
    BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.update_webhooks_updated_at();

-- Create function to set created_by on insert for webhooks
CREATE OR REPLACE FUNCTION public.set_webhooks_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set created_by on insert for webhooks
DROP TRIGGER IF EXISTS on_webhooks_created ON public.webhooks;
CREATE TRIGGER on_webhooks_created
    BEFORE INSERT ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.set_webhooks_created_by();

-- Create function to update the updated_at timestamp for webhook_assignments
CREATE OR REPLACE FUNCTION public.update_webhook_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at timestamp for webhook_assignments
DROP TRIGGER IF EXISTS on_webhook_assignments_updated ON public.webhook_assignments;
CREATE TRIGGER on_webhook_assignments_updated
    BEFORE UPDATE ON public.webhook_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_webhook_assignments_updated_at();

-- Create function to set created_by on insert for webhook_assignments
CREATE OR REPLACE FUNCTION public.set_webhook_assignments_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set created_by on insert for webhook_assignments
DROP TRIGGER IF EXISTS on_webhook_assignments_created ON public.webhook_assignments;
CREATE TRIGGER on_webhook_assignments_created
    BEFORE INSERT ON public.webhook_assignments
    FOR EACH ROW EXECUTE FUNCTION public.set_webhook_assignments_created_by();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS webhooks_is_active_idx ON public.webhooks(is_active);
CREATE INDEX IF NOT EXISTS webhooks_created_at_idx ON public.webhooks(created_at);
CREATE INDEX IF NOT EXISTS webhook_assignments_is_active_idx ON public.webhook_assignments(is_active);
CREATE INDEX IF NOT EXISTS webhook_assignments_webhook_id_idx ON public.webhook_assignments(webhook_id);

-- Create a view to get the currently assigned webhook
CREATE OR REPLACE VIEW public.current_webhook AS
SELECT 
    w.id,
    w.name,
    w.webhook_url,
    w.is_active,
    wa.id as assignment_id,
    wa.is_active as assignment_active
FROM public.webhooks w
LEFT JOIN public.webhook_assignments wa ON w.id = wa.webhook_id AND wa.is_active = true
WHERE w.is_active = true
ORDER BY wa.created_at DESC
LIMIT 1;

-- Grant access to the view
GRANT SELECT ON public.current_webhook TO authenticated;
GRANT SELECT ON public.current_webhook TO service_role; 