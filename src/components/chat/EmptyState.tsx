import React from 'react';
import { MessageCircle, Sparkles, Code, FileText } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const suggestions = [
    { icon: Code, text: "Help me write a function", color: "from-blue-500 to-cyan-500" },
    { icon: FileText, text: "Explain this concept", color: "from-purple-500 to-pink-500" },
    { icon: Sparkles, text: "Generate creative ideas", color: "from-emerald-500 to-teal-500" },
    { icon: MessageCircle, text: "Start a conversation", color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 mb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome to AuravoxAI
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          Your intelligent AI assistant is ready to help. Start a conversation or try one of these suggestions:

        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="glass-card p-4 rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${suggestion.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <suggestion.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {suggestion.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
