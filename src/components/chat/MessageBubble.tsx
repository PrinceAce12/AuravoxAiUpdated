import React, { useState, useEffect } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatMessage } from '../../lib/messageFormatter';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  user?: any;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast, user }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const isUser = message.role === 'user';

  // Load user profile for avatar
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && profileData) {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (message.role === 'assistant' && isLast && !hasAnimated) {
      setIsAnimating(true);
      setHasAnimated(true);
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
      setIsAnimating(false);
    }
  }, [message.content, message.role, isLast, hasAnimated]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const formattedContent = formatMessage(displayedContent);

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} min-w-0`}>
      {isUser ? (
        <Avatar className="w-8 h-8 flex-shrink-0 shadow-md">
          <AvatarImage 
            src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.avatar_url} 
            alt={userProfile?.full_name || user?.email || 'User'} 
          />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
            {(userProfile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`${isUser ? 'flex flex-col' : 'flex-1 min-w-0'}`}>
        <div className={`glass-message-bubble justify-start ${isUser ? 'user-bubble' : 'assistant-bubble'} 
                        ${isAnimating ? 'animate-pulse' : ''} max-w-full overflow-hidden`}>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden"
            dangerouslySetInnerHTML={{ 
              __html: isAnimating ? formatMessage(displayedContent) : formattedContent 
            }}
          />
          
          {!isUser && formattedContent.includes('<pre>') && (
            <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
              {formattedContent.match(/<pre[^>]*>([\s\S]*?)<\/pre>/g)?.map((codeBlock, index) => {
                const code = codeBlock.replace(/<\/?pre[^>]*>/g, '').replace(/<\/?code[^>]*>/g, '');
                const blockId = `${message.id}-${index}`;
                
                return (
                  <Button
                    key={blockId}
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, blockId)}
                    className="h-7 px-2 text-xs hover:bg-white/20 dark:hover:bg-gray-700/50 flex-shrink-0"
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
