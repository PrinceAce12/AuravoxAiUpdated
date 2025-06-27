
import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="glass-message-bubble assistant-bubble">
        <div className="flex items-center space-x-2">
          <div className="typing-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
