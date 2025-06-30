import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Copy, Check, User, Bot, RotateCcw } from 'lucide-react';
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
  onCopy?: (content: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onRetryMessage?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, isLast, user, userProfile, onCopy, onFeedback, onRetryMessage }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isResponseCopied, setIsResponseCopied] = useState(false);
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

  // Memoize copy entire response function
  const copyEntireResponse = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setIsResponseCopied(true);
    setTimeout(() => {
      setIsResponseCopied(false);
    }, 2000);
  }, [message.content]);

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

  // Add copy buttons to code blocks after render
  useEffect(() => {
    if (!isUser && contentRef.current) {
      const preElements = contentRef.current.querySelectorAll('pre.code-block');
      preElements.forEach((pre, index) => {
        // Check if copy button already exists
        if (pre.querySelector('.code-copy-button')) return;
        
        const codeElement = pre.querySelector('code');
        if (!codeElement) return;
        
        const codeText = codeElement.textContent || '';
        const buttonId = `copy-${message.id}-${index}`;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.title = 'Copy code';
        
        // Add click handler
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(codeText);
          
          const copyIcon = copyButton.querySelector('.copy-icon');
          const checkIcon = copyButton.querySelector('.check-icon');
          
          if (copyIcon && checkIcon) {
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            
            setTimeout(() => {
              copyIcon.classList.remove('hidden');
              checkIcon.classList.add('hidden');
            }, 2000);
          }
        });
        
        // Make pre element relative and add button
        const preElement = pre as HTMLElement;
        preElement.style.position = 'relative';
        preElement.style.overflow = 'visible';
        pre.appendChild(copyButton);
        
        // Add hover event listeners for better control
        preElement.addEventListener('mouseenter', () => {
          copyButton.style.opacity = '1';
        });
        
        preElement.addEventListener('mouseleave', () => {
          copyButton.style.opacity = '0.3';
        });
      });
    }
  }, [formattedContent, isUser, message.id]);

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
          
          {/* Copy button for entire response (only for assistant messages with code blocks) */}
          {!isUser && (
            <button
              onClick={copyEntireResponse}
              className="absolute top-1 right-1 ml-2 p-1 z-10 touch-manipulation shadow-none bg-transparent border-none hover:bg-transparent focus:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy entire response"
            >
              {isResponseCopied ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
          
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
