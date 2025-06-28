import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  user?: any;
  onShowAuthModal?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, user, onShowAuthModal }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-3 flex items-end space-x-3 backdrop-blur-md overflow-x-hidden"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={user ? "Type your message here... (Enter to send, Shift+Enter for new line)" : "Sign in to start chatting..."}
          className="w-full bg-transparent border-0 outline-none resize-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[48px] max-h-32 py-2 px-3 rounded-lg focus:border-1 dark:focus:border-1 transition-shadow"
          disabled={disabled}
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
        disabled={!message.trim() || disabled}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {disabled ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
    <p className="text-xs text-gray-500 mt-2 text-center">
      Auravox Ai can make mistakes, so please check the information you receive.
      </p>
    
    </>
  );
};
