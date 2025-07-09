-- Enable real-time functionality for tables that need webhook monitoring
-- This allows the application to listen for database changes in real-time

-- Enable real-time for conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable real-time for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable real-time for webhook_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_settings;

-- Create function to log webhook events (optional - for debugging)
CREATE OR REPLACE FUNCTION log_webhook_event(
    event_type TEXT,
    table_name TEXT,
    record_data JSONB,
    old_record_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO webhook_events (
        event_type,
        table_name,
        record_data,
        old_record_data,
        created_at
    ) VALUES (
        event_type,
        table_name,
        record_data,
        old_record_data,
        NOW()
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Silently fail if webhook_events table doesn't exist
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create webhook_events table for logging (optional)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_data JSONB,
    old_record_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on webhook_events table
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for webhook_events (admin only)
CREATE POLICY "Admin users can view webhook events" ON webhook_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS webhook_events_table_name_idx ON webhook_events(table_name);
CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx ON webhook_events(event_type);

-- Create function to clean up old webhook events (keep last 1000 events)
CREATE OR REPLACE FUNCTION cleanup_webhook_events()
RETURNS VOID AS $$
BEGIN
    DELETE FROM webhook_events 
    WHERE id NOT IN (
        SELECT id FROM webhook_events 
        ORDER BY created_at DESC 
        LIMIT 1000
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old webhook events (runs daily)
SELECT cron.schedule(
    'cleanup-webhook-events',
    '0 2 * * *', -- Daily at 2 AM
    'SELECT cleanup_webhook_events();'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 