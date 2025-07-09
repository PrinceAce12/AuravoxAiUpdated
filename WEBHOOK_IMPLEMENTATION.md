# Webhook Implementation Guide

## Overview

This application implements a comprehensive real-time webhook system that monitors database changes and sends webhook notifications to external services. The system is built using Supabase's real-time features and provides both configuration and monitoring capabilities.

## Features

### 🔄 Real-time Database Monitoring
- **Automatic Detection**: Monitors all database changes in real-time
- **Multiple Tables**: Tracks changes in `conversations`, `messages`, `profiles`, and `webhook_settings`
- **Event Types**: Captures INSERT, UPDATE, and DELETE operations
- **User Context**: Includes user ID information when available

### ⚙️ Webhook Configuration
- **Dynamic Settings**: Configure webhook URLs through the admin interface
- **Active/Inactive Toggle**: Enable or disable webhook delivery
- **Database Storage**: Settings persisted in Supabase database
- **Real-time Updates**: Settings changes take effect immediately

### 📊 Monitoring & Testing
- **Live Status**: Real-time connection status monitoring
- **Event Logging**: View last database event details
- **Webhook Testing**: Test webhook delivery with sample payloads
- **Error Handling**: Comprehensive error reporting and logging

## Architecture

### Core Components

1. **WebhookService** (`src/lib/webhookService.ts`)
   - Singleton service managing webhook operations
   - Handles database subscriptions and webhook delivery
   - Manages webhook settings and configuration

2. **useWebhookRealtime** (`src/hooks/useWebhookRealtime.ts`)
   - React hook for real-time webhook functionality
   - Provides state management and event handling
   - Exposes webhook operations to components

3. **WebhookInitializer** (`src/components/WebhookInitializer.tsx`)
   - Initializes webhook service on app startup
   - Manages lifecycle and cleanup

4. **AdminDashboard** (`src/pages/AdminDashboard.tsx`)
   - Webhook configuration interface
   - Real-time monitoring dashboard
   - Testing and management tools

### Database Schema

#### webhook_settings Table
```sql
CREATE TABLE webhook_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

#### webhook_events Table (Optional)
```sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_data JSONB,
    old_record_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Webhook Payload Format

### Standard Payload Structure
```json
{
  "event": "INSERT|UPDATE|DELETE",
  "table": "table_name",
  "record": {
    // New record data (for INSERT/UPDATE)
  },
  "old_record": {
    // Previous record data (for UPDATE/DELETE)
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "user_id": "user_uuid"
}
```

### Example Payloads

#### Conversation Created
```json
{
  "event": "INSERT",
  "table": "conversations",
  "record": {
    "id": "conv-uuid",
    "title": "New Chat",
    "user_id": "user-uuid",
    "created_at": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "user_id": "user-uuid"
}
```

#### Message Updated
```json
{
  "event": "UPDATE",
  "table": "messages",
  "record": {
    "id": "msg-uuid",
    "content": "Updated message content",
    "conversation_id": "conv-uuid",
    "role": "user",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "old_record": {
    "id": "msg-uuid",
    "content": "Original message content",
    "conversation_id": "conv-uuid",
    "role": "user"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "user_id": "user-uuid"
}
```

## Setup Instructions

### 1. Database Migration
Run the migration to enable real-time functionality:
```bash
# Apply the real-time migration
supabase db push
```

### 2. Configure Webhook URL
1. Navigate to Admin Dashboard (`/admin/dashboard`)
2. Enter your webhook URL in the configuration section
3. Click "Save Webhook URL"
4. Test the webhook using the "Test Webhook" button

### 3. Monitor Real-time Events
- View connection status in the monitoring section
- Check "Last Database Event" for recent activity
- Monitor webhook delivery status

## API Reference

### WebhookService Methods

#### `subscribeToTableChanges(tableName, callback)`
Subscribe to changes in a specific table.

#### `subscribeToAllTables(callback)`
Subscribe to changes in all monitored tables.

#### `updateWebhookSettings(webhookUrl, isActive)`
Update webhook configuration.

#### `testWebhook()`
Send a test webhook payload.

#### `getStatus()`
Get current webhook service status.

### useWebhookRealtime Hook

#### State
- `status`: Current webhook configuration and subscription status
- `isConnected`: Real-time connection status
- `lastEvent`: Most recent database event
- `isLoading`: Loading state for operations
- `error`: Error messages

#### Actions
- `subscribeToAllTables()`: Subscribe to all table changes
- `updateWebhookSettings(url, active)`: Update webhook settings
- `testWebhook()`: Test webhook delivery
- `refreshSettings()`: Refresh webhook configuration

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Webhook settings are protected by authentication
- Only authenticated users can configure webhooks

### Webhook Security
- Validate webhook URLs before saving
- Implement webhook signature verification (recommended)
- Rate limiting for webhook delivery
- Error handling and retry logic

### Data Privacy
- User IDs are included in webhook payloads
- Sensitive data should be filtered before webhook delivery
- Consider data retention policies for webhook events

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
1. Check webhook URL configuration
2. Verify webhook is active
3. Check browser console for errors
4. Test webhook delivery manually

#### Real-time Connection Issues
1. Check Supabase connection
2. Verify real-time is enabled for tables
3. Check network connectivity
4. Review browser console logs

#### Database Changes Not Detected
1. Ensure tables are added to real-time publication
2. Check RLS policies
3. Verify user permissions
4. Check migration status

### Debug Mode
Enable debug logging by checking browser console for:
- Webhook service initialization
- Database change events
- Webhook delivery attempts
- Error messages

## Best Practices

### Webhook Implementation
1. **Idempotency**: Handle duplicate webhook deliveries
2. **Retry Logic**: Implement exponential backoff
3. **Timeout Handling**: Set appropriate timeouts
4. **Error Logging**: Log failed webhook attempts

### Performance
1. **Batch Processing**: Consider batching multiple events
2. **Queue Management**: Implement webhook queuing for high volume
3. **Monitoring**: Track webhook delivery metrics
4. **Cleanup**: Regularly clean up old webhook events

### Security
1. **Signature Verification**: Implement webhook signatures
2. **HTTPS Only**: Use HTTPS for webhook URLs
3. **Access Control**: Limit webhook configuration access
4. **Audit Logging**: Log all webhook configuration changes

## Integration Examples

### n8n Integration
```javascript
// n8n webhook node configuration
{
  "httpMethod": "POST",
  "path": "ai-chat",
  "responseMode": "responseNode",
  "options": {
    "responseHeaders": {
      "Content-Type": "application/json"
    }
  }
}
```

### Zapier Integration
```javascript
// Zapier webhook trigger
{
  "url": "https://hooks.zapier.com/hooks/catch/123456/abc123/",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Custom Webhook Handler
```javascript
// Example webhook handler
app.post('/webhook', (req, res) => {
  const { event, table, record, old_record, timestamp, user_id } = req.body;
  
  // Process the webhook event
  console.log(`Received ${event} event for ${table}`);
  
  // Send response
  res.json({ success: true, message: 'Webhook received' });
});
```

## Support

For issues or questions about the webhook implementation:
1. Check the troubleshooting section
2. Review browser console logs
3. Verify database migration status
4. Test webhook configuration manually 