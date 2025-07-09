import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Webhook, Shield, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebhookSettings } from '@/hooks/useWebhookSettings';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { 
    webhookSettings, 
    isLoading: isLoadingSettings, 
    error: settingsError, 
    saveWebhookUrl, 
    loadWebhookSettings 
  } = useWebhookSettings();

  // Load saved webhook URL from database on component mount
  useEffect(() => {
    if (webhookSettings?.webhook_url) {
      setWebhookUrl(webhookSettings.webhook_url);
    }
  }, [webhookSettings]);

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save webhook URL to database
      await saveWebhookUrl(webhookUrl);
      
      toast({
        title: "Success",
        description: "Webhook URL has been saved successfully to the database",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save webhook URL to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your AI assistant settings</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="grid gap-6">
          {/* Webhook Configuration */}
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>n8n Webhook Configuration</CardTitle>
                  <CardDescription>Configure the webhook URL for AI processing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingsError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Error loading webhook settings: {settingsError}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadWebhookSettings}
                    className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/ai-chat"
                  disabled={isLoadingSettings}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This webhook will be called to get AI responses for user messages
                </p>
                {webhookSettings?.webhook_url && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Webhook URL is configured and active
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleSaveWebhook} 
                  disabled={isSaving || isLoadingSettings}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Webhook URL'}
                </Button>
                
                {isLoadingSettings && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading settings...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable the chat interface</p>
                </div>
                <Button
                  variant={isMaintenanceMode ? "destructive" : "outline"}
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                >
                  {isMaintenanceMode ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Logs */}
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Chat Logs</CardTitle>
                  <CardDescription>Monitor and manage chat conversations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Chat logs will appear here</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Connect to Supabase to view conversation history
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
