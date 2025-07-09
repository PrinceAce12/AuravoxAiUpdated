import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { User, Bot, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatMessage } from '../../lib/messageFormatter';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
  };
  avatar_url?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  user?: User;
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  user?: User;
  userProfile?: UserProfile | null;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onRetryMessage?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, isLast, user, userProfile, onFeedback, onRetryMessage }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  // Memoize expensive computations
  const formattedContent = useMemo(() => {
    return formatMessage(displayedContent);
  }, [displayedContent]);

  const avatarFallback = useMemo(() => {
    return (userProfile?.full_name || user?.email || 'U')[0].toUpperCase();
  }, [userProfile?.full_name, user?.email]);

  const avatarSrc = useMemo(() => {
    return userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.avatar_url;
  }, [userProfile?.avatar_url, user?.user_metadata?.avatar_url, user?.avatar_url]);

  const avatarAlt = useMemo(() => {
    return userProfile?.full_name || user?.email || 'User';
  }, [userProfile?.full_name, user?.email]);

  // Optimize typewriter animation with requestAnimationFrame
  useEffect(() => {
    if (message.role === 'assistant' && isLast && !hasAnimated) {
      setIsAnimating(true);
      setHasAnimated(true);
      
      const content = message.content;
      let index = 0;
      let animationId: number;

      const animate = () => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
          animationId = requestAnimationFrame(() => {
            setTimeout(animate, 20);
          });
        } else {
          setIsAnimating(false);
        }
      };

      animationId = requestAnimationFrame(animate);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    } else {
      setDisplayedContent(message.content);
      setIsAnimating(false);
    }
  }, [message.content, message.role, isLast, hasAnimated]);

  // Memoize retry function
  const handleRetry = useCallback(() => {
    if (onRetryMessage) {
      onRetryMessage(message.id);
    }
  }, [message.id, onRetryMessage]);

  // Memoize timestamp
  const formattedTime = useMemo(() => {
    return new Date(message.created_at).toLocaleTimeString();
  }, [message.created_at]);

  return (
    <div 
      className={`message-bubble-container ${isUser ? 'user-message mb-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar removed for both user and assistant */}
      <div className={`message-content ${isUser ? 'user-content' : ''}`}>
        <div className={`glass-message-bubble justify-start ${isUser ? 'user-bubble' : 'assistant-bubble'} 
                        ${isAnimating ? 'animate-pulse' : ''} max-w-full overflow-hidden
                        px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base relative group`}>
          
          <div 
            ref={contentRef}
            className="prose prose-base sm:prose-lg dark:prose-invert max-w-none break-words overflow-hidden typewriter-content
                       prose-p:my-2 sm:prose-p:my-3 prose-ul:my-2 sm:prose-ul:my-3 prose-ol:my-2 sm:prose-ol:my-3
                       prose-li:my-1 sm:prose-li:my-2 prose-pre:my-3 sm:prose-pre:my-4"
            dangerouslySetInnerHTML={{ 
              __html: formattedContent 
            }}
          />
        </div>
        
        <div className={`text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'text-right px-1 sm:px-2' : 'mt-1 sm:mt-2 px-1 sm:px-2'}`}>
          {isUser ? (
            <button
              onClick={handleRetry}
              className={`hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer p-1 touch-manipulation ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              title="Retry message"
              tabIndex={-1}
              style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
            >
              <RotateCcw className="w-2.5 h-2.5 sm:w-3 h-3 inline-block" />
            </button>
          ) : (
            formattedTime
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
