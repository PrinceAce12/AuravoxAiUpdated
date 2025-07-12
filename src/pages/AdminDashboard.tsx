import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database as DatabaseIcon, Webhook, Shield, LogOut, Save, TestTube, Activity, Wifi, WifiOff, BarChart3, Plus, Trash2, User, Camera, CameraOff, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMultipleWebhooks } from '@/hooks/useMultipleWebhooks';
import { useWebhookRealtime } from '@/hooks/useWebhookRealtime';
import { Switch } from '@/components/ui/switch';
import AdminMonitoring from './admin/AdminMonitoring';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'settings'>('monitoring');
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  

  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    webhooks,
    currentWebhook,
    isLoading: isLoadingWebhooks, 
    error: webhooksError, 
    addWebhook,
    assignWebhook,
    deleteWebhook,
    loadWebhooks 
  } = useMultipleWebhooks();

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

  // Load webhooks on component mount
  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);



  const handleAddWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter both webhook name and URL",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Add webhook to database
      await addWebhook(webhookName, webhookUrl);
      
      // Clear form
      setWebhookName('');
      setWebhookUrl('');
      
      toast({
        title: "Webhook Added",
        description: "New webhook has been added successfully",
      });
    } catch (error) {
      console.error('Error adding webhook:', error);
      toast({
        title: "Error",
        description: "Failed to add webhook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignWebhook = async (webhookId: string) => {
    try {
      await assignWebhook(webhookId);
      toast({
        title: "Success",
        description: "Webhook has been assigned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign webhook",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhook(webhookId);
      toast({
        title: "Success",
        description: "Webhook has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Secure admin panel - QR access verified</p>
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
                    <CardDescription>Add and manage multiple webhooks for AI processing responses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooksError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error loading webhooks: {webhooksError}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadWebhooks}
                      className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                
                {/* Add New Webhook Form */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white">Add New Webhook</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook Name
                      </label>
                      <input
                        type="text"
                        value={webhookName}
                        onChange={(e) => setWebhookName(e.target.value)}
                        placeholder="My Webhook"
                        disabled={isLoadingWebhooks}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com/webhook/ai-chat"
                        disabled={isLoadingWebhooks}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddWebhook} 
                    disabled={isSaving || isLoadingWebhooks}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isSaving ? 'Adding...' : 'Add Webhook'}
                  </Button>
                </div>

                {/* Current Assigned Webhook */}
                {currentWebhook && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-green-900 dark:text-green-100">Currently Assigned Webhook</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          <strong>Name:</strong> {currentWebhook.name}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          <strong>URL:</strong> {currentWebhook.webhook_url}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-green-700 dark:text-green-300">Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhook List */}
                {webhooks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Available Webhooks</h3>
                    <div className="space-y-2">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{webhook.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{webhook.webhook_url}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleAssignWebhook(webhook.id)}
                              disabled={currentWebhook?.id === webhook.id}
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              {currentWebhook?.id === webhook.id ? 'Assigned' : 'Assign Webhook'}
                            </Button>
                            <Button
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoadingWebhooks && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading webhooks...
                  </div>
                )}
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
                      <DatabaseIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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


          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
