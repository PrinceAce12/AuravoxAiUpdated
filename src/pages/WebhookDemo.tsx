import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WebhookTest from '@/components/WebhookTest';

const WebhookDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Webhook Management Demo</h1>
              <p className="text-gray-600 dark:text-gray-300">Test the new multiple webhook functionality</p>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">How to Use</h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>1. <strong>Add Webhooks:</strong> Enter a name and URL, then click "Add Webhook"</p>
            <p>2. <strong>Assign Webhook:</strong> Click "Assign Webhook" to make it the active webhook</p>
            <p>3. <strong>View Current:</strong> The currently assigned webhook is displayed in green</p>
            <p>4. <strong>Delete:</strong> Use the trash icon to remove webhooks</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-3">
              Note: This demo uses mock data since the database migration requires Docker to be running.
            </p>
          </div>
        </div>

        {/* Webhook Management Component */}
        <WebhookTest />
      </div>
    </div>
  );
};

export default WebhookDemo; 