import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useMultipleWebhooks } from '@/hooks/useMultipleWebhooks';
import { useToast } from '@/hooks/use-toast';

const WebhookTest = () => {
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const { toast } = useToast();
  const { 
    webhooks,
    currentWebhook,
    isLoading, 
    error, 
    addWebhook,
    assignWebhook,
    deleteWebhook,
    loadWebhooks,
    useMockData
  } = useMultipleWebhooks();

  const handleAddWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter both webhook name and URL",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    
    try {
      await addWebhook(webhookName, webhookUrl);
      
      // Clear form
      setWebhookName('');
      setWebhookUrl('');
      
      toast({
        title: "Success",
        description: "Webhook has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add webhook",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>Add and manage multiple webhooks with assignment functionality</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Data Notice */}
          {useMockData && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                🚧 Using mock data - Database connection not available. Start Docker and run migrations to use real data.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {error}
              </p>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddWebhook} 
              disabled={isAdding || isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add Webhook'}
            </Button>
          </div>

          {/* Current Assigned Webhook */}
          {currentWebhook && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Currently Assigned Webhook
                  </h3>
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Loading webhooks...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && webhooks.length === 0 && !currentWebhook && (
            <div className="text-center py-8">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Webhooks</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add your first webhook to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookTest; 