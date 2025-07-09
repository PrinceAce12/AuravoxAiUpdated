import React, { memo } from 'react';
import { MessageCircle } from 'lucide-react';

export const EmptyState: React.FC = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 mb-4 sm:mb-8 max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 px-2">
          Welcome to Q0
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md px-4">
          How can I help you?
        </p>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
