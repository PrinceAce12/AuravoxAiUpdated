
import React, { useState, useEffect } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMessage } from '../../lib/messageFormatter';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const isUser = message.role === 'user';
  const formattedContent = formatMessage(message.content);

  useEffect(() => {
    if (message.role === 'assistant' && isLast) {
      setIsAnimating(true);
      let index = 0;
      const content = message.content;
      
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          setIsAnimating(false);
          clearInterval(timer);
        }
      }, 20);

      return () => clearInterval(timer);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.role, isLast]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`glass-message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} 
                        ${isAnimating ? 'animate-pulse' : ''}`}>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: isAnimating ? formatMessage(displayedContent) : formattedContent 
            }}
          />
          
          {!isUser && formattedContent.includes('<pre>') && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formattedContent.match(/<pre[^>]*>([\s\S]*?)<\/pre>/g)?.map((codeBlock, index) => {
                const code = codeBlock.replace(/<\/?pre[^>]*>/g, '').replace(/<\/?code[^>]*>/g, '');
                const blockId = `${message.id}-${index}`;
                
                return (
                  <Button
                    key={blockId}
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, blockId)}
                    className="h-7 px-2 text-xs hover:bg-white/20 dark:hover:bg-gray-700/50"
                  >
                    {copiedStates[blockId] ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    {copiedStates[blockId] ? 'Copied!' : 'Copy'}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
