import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Webhook {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface WebhookAssignment {
  id: string;
  webhook_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CurrentWebhook {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  assignment_id: string | null;
  assignment_active: boolean | null;
}

export const useMultipleWebhooks = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [currentWebhook, setCurrentWebhook] = useState<CurrentWebhook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for demonstration
  const mockWebhooks: Webhook[] = [
    {
      id: '1',
      name: 'Production Webhook',
      webhook_url: 'https://api.example.com/webhook/prod',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    },
    {
      id: '2',
      name: 'Development Webhook',
      webhook_url: 'https://api.example.com/webhook/dev',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    },
    {
      id: '3',
      name: 'Testing Webhook',
      webhook_url: 'https://api.example.com/webhook/test',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    },
  ];

  // Load all webhooks
  const loadWebhooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to connect to Supabase first
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If database connection fails, use mock data
        console.log('Database connection failed, using mock data');
        setUseMockData(true);
        setWebhooks(mockWebhooks);
        setCurrentWebhook({
          id: '1',
          name: 'Production Webhook',
          webhook_url: 'https://api.example.com/webhook/prod',
          is_active: true,
          assignment_id: '1',
          assignment_active: true,
        });
      } else {
        setUseMockData(false);
        setWebhooks(data || []);
      }
    } catch (err: any) {
      console.log('Using mock data due to error:', err.message);
      setUseMockData(true);
      setWebhooks(mockWebhooks);
      setCurrentWebhook({
        id: '1',
        name: 'Production Webhook',
        webhook_url: 'https://api.example.com/webhook/prod',
        is_active: true,
        assignment_id: '1',
        assignment_active: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load current assigned webhook
  const loadCurrentWebhook = useCallback(async () => {
    if (useMockData) {
      setCurrentWebhook({
        id: '1',
        name: 'Production Webhook',
        webhook_url: 'https://api.example.com/webhook/prod',
        is_active: true,
        assignment_id: '1',
        assignment_active: true,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('current_webhook')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentWebhook(data);
    } catch (err: any) {
      console.error('Error loading current webhook:', err);
      setCurrentWebhook(null);
    }
  }, [useMockData]);

  // Add new webhook
  const addWebhook = useCallback(async (name: string, webhookUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        const newWebhook: Webhook = {
          id: Date.now().toString(),
          name,
          webhook_url: webhookUrl,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          updated_by: null,
        };
        setWebhooks(prev => [newWebhook, ...prev]);
        return newWebhook;
      }

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          name,
          webhook_url: webhookUrl,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setWebhooks(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to add webhook');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  // Assign webhook
  const assignWebhook = useCallback(async (webhookId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        const webhook = webhooks.find(w => w.id === webhookId);
        if (webhook) {
          setCurrentWebhook({
            id: webhook.id,
            name: webhook.name,
            webhook_url: webhook.webhook_url,
            is_active: webhook.is_active,
            assignment_id: webhookId,
            assignment_active: true,
          });
        }
        return;
      }

      // First, deactivate all existing assignments
      const { error: deactivateError } = await supabase
        .from('webhook_assignments')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) throw deactivateError;

      // Create new assignment
      const { data, error } = await supabase
        .from('webhook_assignments')
        .insert({
          webhook_id: webhookId,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Reload current webhook
      await loadCurrentWebhook();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to assign webhook');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, webhooks, loadCurrentWebhook]);

  // Delete webhook
  const deleteWebhook = useCallback(async (webhookId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        setWebhooks(prev => prev.filter(w => w.id !== webhookId));
        
        // If the deleted webhook was the current one, clear current webhook
        if (currentWebhook?.id === webhookId) {
          setCurrentWebhook(null);
        }
        return;
      }

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
      
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      
      // If the deleted webhook was the current one, reload current webhook
      if (currentWebhook?.id === webhookId) {
        await loadCurrentWebhook();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete webhook');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, currentWebhook?.id, loadCurrentWebhook]);

  // Update webhook
  const updateWebhook = useCallback(async (webhookId: string, updates: Partial<Webhook>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        setWebhooks(prev => prev.map(w => w.id === webhookId ? { ...w, ...updates } : w));
        
        // If this was the current webhook, update it
        if (currentWebhook?.id === webhookId) {
          setCurrentWebhook(prev => prev ? { ...prev, ...updates } : null);
        }
        return;
      }

      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', webhookId)
        .select()
        .single();

      if (error) throw error;
      
      setWebhooks(prev => prev.map(w => w.id === webhookId ? data : w));
      
      // If this was the current webhook, reload it
      if (currentWebhook?.id === webhookId) {
        await loadCurrentWebhook();
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update webhook');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, currentWebhook?.id, loadCurrentWebhook]);

  // Get current webhook URL
  const getCurrentWebhookUrl = useCallback(() => {
    return currentWebhook?.webhook_url || null;
  }, [currentWebhook]);

  // Check if webhook is configured
  const isWebhookConfigured = useCallback(() => {
    const configured = !!(currentWebhook?.webhook_url && currentWebhook.is_active);
    return configured;
  }, [currentWebhook]);

  // Load data on mount
  useEffect(() => {
    loadWebhooks();
    loadCurrentWebhook();
  }, [loadWebhooks, loadCurrentWebhook]);

  return {
    webhooks,
    currentWebhook,
    isLoading,
    error,
    loadWebhooks,
    loadCurrentWebhook,
    addWebhook,
    assignWebhook,
    deleteWebhook,
    updateWebhook,
    getCurrentWebhookUrl,
    isWebhookConfigured,
    useMockData,
  };
}; 