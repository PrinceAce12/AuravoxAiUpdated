import React, { useState, useCallback, memo, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  user?: User | null;
  onShowAuthModal?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  messages?: Message[];
}

export interface ChatInputRef {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ onSendMessage, disabled, user, onShowAuthModal, isLoading = false, placeholder = "Type your message...", messages = [] }, ref) => {
  const [message, setMessage] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Expose focus method to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  // Memoize placeholder text
  const placeholderText = useMemo(() => {
    return user ? "Ask me anything..." : "Sign in to start chatting...";
  }, [user]);

  // Memoize button disabled state
  const isButtonDisabled = useMemo(() => {
    return !message.trim() || disabled;
  }, [message, disabled]);

  // Memoize textarea disabled state
  const isTextareaDisabled = useMemo(() => {
    return disabled;
  }, [disabled]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // Check if user is authenticated
      if (!user) {
        onShowAuthModal?.();
        return;
      }
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, disabled, user, onSendMessage, onShowAuthModal]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="w-full sm:max-w-3xl sm:mx-auto rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 sm:p-3 flex flex-row items-end gap-1.5 sm:gap-3 backdrop-blur-md overflow-x-hidden"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="w-full bg-transparent border-0 outline-none resize-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[36px] sm:min-h-[44px] max-h-24 sm:max-h-36 py-1.5 px-2 sm:px-3 rounded-lg focus:border-1 dark:focus:border-1 transition-shadow text-sm sm:text-base leading-relaxed"
          disabled={isTextareaDisabled}
          rows={1}
          autoFocus
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
          }}
          
        />
      </div>
      <Button
        type="submit"
        disabled={isButtonDisabled}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-2.5 sm:px-4 py-2 h-10 sm:h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 touch-manipulation text-base sm:text-lg"
      >
        {disabled ? (
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
        ) : (
          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </Button>
    </form>
    <p className="text-xs sm:text-sm text-gray-500 mt-0 text-center px-3 sm:px-4 mb-16 sm:mb-0">
      Q0 can make mistakes, so please check the information you receive.
    </p>
    
    </>
  );
});

ChatInput.displayName = 'ChatInput';
