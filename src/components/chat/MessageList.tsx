import React from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  user?: any;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, user }) => {
  if (messages.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 space-y-1 pr-2 custom-scrollbar overflow-x-hidden">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          user={user}
        />
      ))}
      {isLoading && <TypingIndicator />}
    </div>  
  );
};
