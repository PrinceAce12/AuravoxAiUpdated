import React, { useMemo, memo, useRef, useEffect, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import { rafThrottle, addPassiveEventListener } from '@/lib/performance';

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

interface VirtualizedMessage extends Message {
  originalIndex: number;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  user?: User | null;
  userProfile?: UserProfile | null;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onRetryMessage?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = memo(({ messages, isLoading = false, user, userProfile, onFeedback, onRetryMessage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: messages.length });
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Memoize empty state check
  const isEmpty = useMemo(() => {
    return messages.length === 0 && !isLoading;
  }, [messages.length, isLoading]);

  // Optimized scroll handler using RAF throttling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    
    // Check if we should show the scroll-to-bottom button
    const isNearBottom = scrollHeight - scrollTop - containerHeight < 150;
    setShowScrollButton(!isNearBottom && messages.length > 0);
    
    // Estimate which messages are visible
    const messageHeight = 100; // Approximate height per message
    const start = Math.floor(scrollTop / messageHeight);
    const end = Math.min(messages.length, Math.ceil((scrollTop + containerHeight) / messageHeight));
    
    setVisibleRange({ start, end });
  }, [messages.length]);

  // Throttled scroll handler
  const throttledScrollHandler = useMemo(() => {
    return rafThrottle(handleScroll);
  }, [handleScroll]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Check if user is near the bottom
      const container = containerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
          // Use requestAnimationFrame for smooth scrolling
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      }
    }
  }, [messages.length, scrollToBottom]);

  // Simple virtualization - only render messages that are likely to be visible
  const visibleMessages = useMemo((): VirtualizedMessage[] => {
    if (messages.length <= 50) {
      // If we have 50 or fewer messages, render all
      return messages.map((message, index) => ({
        ...message,
        originalIndex: index
      }));
    }
    
    // For larger lists, render a window around the visible area
    const start = Math.max(0, visibleRange.start - 10);
    const end = Math.min(messages.length, visibleRange.end + 10);
    
    return messages.slice(start, end).map((message, index) => ({
      ...message,
      originalIndex: start + index
    }));
  }, [messages, visibleRange]);

  // Update visible range based on scroll position with optimized event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive event listener for better performance
    const cleanup = addPassiveEventListener(container, 'scroll', throttledScrollHandler);
    
    // Initial calculation
    throttledScrollHandler();
    
    return cleanup;
  }, [throttledScrollHandler]);

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <div className="relative flex-1">
      <div 
        ref={containerRef}
        className="flex-1 space-y-1 sm:space-y-2 pr-2 sm:pr-3 custom-scrollbar overflow-x-hidden overflow-y-auto"
        style={{ 
          height: '100%',
          contain: 'layout style paint',
          willChange: 'scroll-position'
        }}
      >
        {visibleMessages.map((message, index) => {
          // Calculate if this is the last message in the entire list
          const isLastInEntireList = message.originalIndex === messages.length - 1;
          
          return (
            <div 
              key={message.id}
              style={{ 
                contain: 'layout style paint',
                willChange: 'auto'
              }}
            >
              <MessageBubble
                message={message}
                isLast={isLastInEntireList}
                user={user}
                userProfile={userProfile}
                onFeedback={onFeedback}
                onRetryMessage={onRetryMessage}
              />
            </div>
          );
        })}
        {isLoading && (
          <div className="message-loading">
            <TypingIndicator />
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-12 h-12 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10 touch-manipulation"
          aria-label="Scroll to bottom"
        >
          <svg className="w-6 h-6 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
});

MessageList.displayName = 'MessageList';
