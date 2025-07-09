import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebhookSettings {
  id: string;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export const useWebhookSettings = () => {
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load webhook settings from database
  const loadWebhookSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No webhook settings found, create a default one
          const { data: newSettings, error: createError } = await supabase
            .from('webhook_settings')
            .insert({
              webhook_url: null,
              is_active: true,
            })
            .select()
            .single();

          if (createError) throw createError;
          setWebhookSettings(newSettings);
        } else {
          throw error;
        }
      } else {
        setWebhookSettings(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load webhook settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save webhook URL to database
  const saveWebhookUrl = useCallback(async (webhookUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let settingsId = webhookSettings?.id;
      
      if (!settingsId) {
        // Create new webhook settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('webhook_settings')
          .insert({
            webhook_url: webhookUrl,
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        setWebhookSettings(newSettings);
        return newSettings;
      } else {
        // Update existing webhook settings
        const { data: updatedSettings, error: updateError } = await supabase
          .from('webhook_settings')
          .update({
            webhook_url: webhookUrl,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settingsId)
          .select()
          .single();

        if (updateError) throw updateError;
        setWebhookSettings(updatedSettings);
        return updatedSettings;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save webhook URL');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [webhookSettings?.id]);

  // Get the current webhook URL
  const getWebhookUrl = useCallback(() => {
    const url = webhookSettings?.webhook_url || null;
    return url;
  }, [webhookSettings]);

  // Check if webhook is configured
  const isWebhookConfigured = useCallback(() => {
    const configured = !!(webhookSettings?.webhook_url && webhookSettings.is_active);
    return configured;
  }, [webhookSettings]);

  // Load settings on mount
  useEffect(() => {
    loadWebhookSettings();
  }, [loadWebhookSettings]);

  return {
    webhookSettings,
    isLoading,
    error,
    loadWebhookSettings,
    saveWebhookUrl,
    getWebhookUrl,
    isWebhookConfigured,
  };
}; 