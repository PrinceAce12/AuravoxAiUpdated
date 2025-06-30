import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Webhook, Shield, ArrowLeft, LogOut, Save, TestTube, Activity, Wifi, WifiOff, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useWebhookSettings } from '@/hooks/useWebhookSettings';
import { useWebhookRealtime } from '@/hooks/useWebhookRealtime';
import AdminMonitoring from './admin/AdminMonitoring';

const AdminDashboard = () => {
  console.log('AdminDashboard component rendering');
  
  const [activeTab, setActiveTab] = useState<'monitoring' | 'settings'>('monitoring');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    webhookSettings, 
    isLoading: isLoadingSettings, 
    error: settingsError, 
    saveWebhookUrl, 
    loadWebhookSettings 
  } = useWebhookSettings();

  // Real-time webhook functionality
  const {
    status: webhookStatus,
    isConnected,
    lastEvent,
    isLoading: isWebhookLoading,
    error: webhookError,
    updateWebhookSettings: updateRealtimeWebhook,
    testWebhook,
    refreshSettings,
  } = useWebhookRealtime();

  // Load saved webhook URL from database on component mount
  useEffect(() => {
    console.log('AdminDashboard useEffect - webhookSettings:', webhookSettings);
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
      
      // Update real-time webhook service
      await updateRealtimeWebhook(webhookUrl, true);
      
      console.log('Webhook URL saved to database:', webhookUrl);
      
      toast({
        title: "Success",
        description: "Webhook URL has been saved successfully to the database",
      });
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      const response = await testWebhook();
      
      if (response.success) {
        toast({
          title: "Webhook Test Successful",
          description: response.message,
        });
      } else {
        toast({
          title: "Webhook Test Failed",
          description: response.error || response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test webhook",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_access');
    sessionStorage.removeItem('admin_access_time');
    navigate('/chat');
  };

  console.log('AdminDashboard render - activeTab:', activeTab, 'isLoadingSettings:', isLoadingSettings);

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Secure admin panel - QR access verified</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
          <Button
            variant={activeTab === 'monitoring' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('monitoring')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monitoring</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'monitoring' ? (
          <AdminMonitoring />
        ) : (
          <div className="grid gap-6">
            {/* Webhook Configuration */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Webhook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>AI Webhook Configuration</CardTitle>
                    <CardDescription>Configure the webhook URL for AI processing responses</CardDescription>
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

            {/* Real-time Webhook Monitoring */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Real-time Webhook Monitoring</CardTitle>
                    <CardDescription>Monitor database changes and webhook delivery status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isConnected ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Database Connection
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isConnected ? 'Connected and monitoring changes' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Webhook Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Webhook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Webhook Status</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      URL: {webhookStatus.webhookUrl ? 'Configured' : 'Not configured'}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Active: {webhookStatus.isActive ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">Monitored Tables</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {webhookStatus.subscriptions.length} tables
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {webhookStatus.subscriptions.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Test Webhook Button */}
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={handleTestWebhook}
                    disabled={isWebhookLoading || !webhookStatus.webhookUrl}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isWebhookLoading ? 'Testing...' : 'Test Webhook'}
                  </Button>
                  
                  <Button 
                    onClick={refreshSettings}
                    disabled={isWebhookLoading}
                    variant="ghost"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>

                {/* Last Event Display */}
                {lastEvent && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Last Database Event</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Table:</strong> {lastEvent.table}</p>
                      <p><strong>Event:</strong> {lastEvent.event}</p>
                      <p><strong>Time:</strong> {new Date(lastEvent.timestamp).toLocaleString()}</p>
                      {lastEvent.user_id && (
                        <p><strong>User ID:</strong> {lastEvent.user_id}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {webhookError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Webhook Error: {webhookError}
                    </p>
                  </div>
                )}
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
