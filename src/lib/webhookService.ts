import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface WebhookPayload {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
  timestamp: string;
  user_id?: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class WebhookService {
  private webhookUrl: string | null = null;
  private isActive: boolean = false;
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    this.initializeWebhookSettings();
  }

  // Initialize webhook settings from database
  private async initializeWebhookSettings() {
    try {
      const { data, error } = await supabase
        .from('current_webhook')
        .select('webhook_url, is_active')
        .single();

      if (!error && data) {
        this.webhookUrl = data.webhook_url;
        this.isActive = data.is_active;
        console.log('Webhook settings loaded:', { url: this.webhookUrl, active: this.isActive });
      }
    } catch (error) {
      console.error('Error loading webhook settings:', error);
    }
  }

  // Update webhook settings
  public async updateWebhookSettings(webhookUrl: string, isActive: boolean = true) {
    try {
      // This method is kept for backward compatibility
      // The new system uses the current_webhook view
      console.log('Webhook settings update requested:', { webhookUrl, isActive });
      
      // Reload settings from the current webhook view
      await this.refreshSettings();
      
      return { webhook_url: this.webhookUrl, is_active: this.isActive };
    } catch (error) {
      console.error('Error updating webhook settings:', error);
      throw error;
    }
  }

  // Send webhook payload
  private async sendWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    if (!this.webhookUrl || !this.isActive) {
      return {
        success: false,
        message: 'Webhook not configured or inactive',
      };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Q0-Webhook/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Webhook sent successfully',
          data,
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error sending webhook:', error);
      return {
        success: false,
        message: 'Failed to send webhook',
        error: error.message,
      };
    }
  }

  // Subscribe to real-time database changes
  public subscribeToTableChanges(tableName: string, callback?: (payload: WebhookPayload) => void) {
    if (this.subscriptions.has(tableName)) {
      this.unsubscribeFromTableChanges(tableName);
    }

    const subscription = supabase
      .channel(`webhook-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        async (payload) => {
          const webhookPayload: WebhookPayload = {
            event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: tableName,
            record: payload.new,
            old_record: payload.old,
            timestamp: new Date().toISOString(),
            user_id: (payload.new as any)?.user_id || (payload.old as any)?.user_id,
          };

          console.log(`Database change detected in ${tableName}:`, webhookPayload);

          // Send webhook if configured
          if (this.webhookUrl && this.isActive) {
            const response = await this.sendWebhook(webhookPayload);
            console.log('Webhook response:', response);
          }

          // Call custom callback if provided
          if (callback) {
            callback(webhookPayload);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(tableName, subscription);
    console.log(`Subscribed to ${tableName} changes`);
  }

  // Unsubscribe from table changes
  public unsubscribeFromTableChanges(tableName: string) {
    const subscription = this.subscriptions.get(tableName);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(tableName);
      console.log(`Unsubscribed from ${tableName} changes`);
    }
  }

  // Subscribe to all relevant tables
  public subscribeToAllTables(callback?: (payload: WebhookPayload) => void) {
    const tables = ['conversations', 'messages', 'profiles', 'webhook_settings'];
    
    tables.forEach(table => {
      this.subscribeToTableChanges(table, callback);
    });

    console.log('Subscribed to all table changes');
  }

  // Unsubscribe from all tables
  public unsubscribeFromAllTables() {
    this.subscriptions.forEach((subscription, tableName) => {
      this.unsubscribeFromTableChanges(tableName);
    });
  }

  // Test webhook connection
  public async testWebhook(): Promise<WebhookResponse> {
    const testPayload: WebhookPayload = {
      event: 'INSERT',
      table: 'test',
      record: {
        id: 'test-id',
        message: 'This is a test webhook from AuravoxAI',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.sendWebhook(testPayload);
  }

  // Get current webhook status
  public getStatus() {
    return {
      webhookUrl: this.webhookUrl,
      isActive: this.isActive,
      subscriptions: Array.from(this.subscriptions.keys()),
    };
  }

  // Refresh webhook settings from database
  public async refreshSettings() {
    await this.initializeWebhookSettings();
  }
}

// Create singleton instance
export const webhookService = new WebhookService();

// Export for use in components
export default webhookService; 