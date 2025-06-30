import React, { memo } from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = memo(() => {
  return (
    <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-4 px-1 sm:px-2 py-0.5 sm:py-1">
      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      </div>
      
      <div className="glass-message-bubble assistant-bubble px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center space-x-2">
          <div className="typing-dots">
            <div className="dot animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="dot animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="dot animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-300">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';
