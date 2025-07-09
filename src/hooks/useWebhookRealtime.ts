import { useState, useEffect, useCallback } from 'react';
import { webhookService, type WebhookPayload, type WebhookResponse } from '@/lib/webhookService';

export interface WebhookStatus {
  webhookUrl: string | null;
  isActive: boolean;
  subscriptions: string[];
}

export const useWebhookRealtime = () => {
  const [status, setStatus] = useState<WebhookStatus>({
    webhookUrl: null,
    isActive: false,
    subscriptions: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebhookPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update status from webhook service
  const updateStatus = useCallback(() => {
    const currentStatus = webhookService.getStatus();
    setStatus(currentStatus);
  }, []);

  // Subscribe to all table changes
  const subscribeToAllTables = useCallback(() => {
    try {
      webhookService.subscribeToAllTables((payload: WebhookPayload) => {
        setLastEvent(payload);
        console.log('Webhook event received:', payload);
      });
      setIsConnected(true);
      updateStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe to table changes');
      setIsConnected(false);
    }
  }, [updateStatus]);

  // Unsubscribe from all table changes
  const unsubscribeFromAllTables = useCallback(() => {
    try {
      webhookService.unsubscribeFromAllTables();
      setIsConnected(false);
      updateStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to unsubscribe from table changes');
    }
  }, [updateStatus]);

  // Subscribe to specific table
  const subscribeToTable = useCallback((tableName: string, callback?: (payload: WebhookPayload) => void) => {
    try {
      webhookService.subscribeToTableChanges(tableName, callback);
      updateStatus();
    } catch (err: any) {
      setError(err.message || `Failed to subscribe to ${tableName}`);
    }
  }, [updateStatus]);

  // Unsubscribe from specific table
  const unsubscribeFromTable = useCallback((tableName: string) => {
    try {
      webhookService.unsubscribeFromTableChanges(tableName);
      updateStatus();
    } catch (err: any) {
      setError(err.message || `Failed to unsubscribe from ${tableName}`);
    }
  }, [updateStatus]);

  // Update webhook settings
  const updateWebhookSettings = useCallback(async (webhookUrl: string, isActive: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await webhookService.updateWebhookSettings(webhookUrl, isActive);
      updateStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to update webhook settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateStatus]);

  // Test webhook connection
  const testWebhook = useCallback(async (): Promise<WebhookResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await webhookService.testWebhook();
      return response;
    } catch (err: any) {
      const errorResponse: WebhookResponse = {
        success: false,
        message: 'Failed to test webhook',
        error: err.message,
      };
      setError(err.message || 'Failed to test webhook');
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh webhook settings
  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await webhookService.refreshSettings();
      updateStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh webhook settings');
    } finally {
      setIsLoading(false);
    }
  }, [updateStatus]);

  // Initialize on mount
  useEffect(() => {
    updateStatus();
    
    // Auto-subscribe to all tables when component mounts
    subscribeToAllTables();

    // Cleanup on unmount
    return () => {
      unsubscribeFromAllTables();
    };
  }, [updateStatus, subscribeToAllTables, unsubscribeFromAllTables]);

  return {
    // State
    status,
    isConnected,
    lastEvent,
    isLoading,
    error,
    
    // Actions
    subscribeToAllTables,
    unsubscribeFromAllTables,
    subscribeToTable,
    unsubscribeFromTable,
    updateWebhookSettings,
    testWebhook,
    refreshSettings,
    updateStatus,
  };
}; 