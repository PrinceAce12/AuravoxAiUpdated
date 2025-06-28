import React from 'react';
import { MessageCircle } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 mb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome to Auravox AI
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          How can I help you?
        </p>
      </div>
    </div>
  );
};
