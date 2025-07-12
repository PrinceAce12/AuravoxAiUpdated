import React, { useRef } from 'react';
import { ChatInputRef } from './ChatInput';
import MobileChatLayout from './MobileChatLayout';
import { MessageList } from './MessageList';

interface MobileChatExampleProps {
  messages: any[];
  isLoading: boolean;
  user: any;
  userProfile: any;
  onSendMessage: (message: string) => void;
  onShowAuthModal: () => void;
  onRetryMessage: (messageId: string) => void;
}

export const MobileChatExample: React.FC<MobileChatExampleProps> = ({
  messages,
  isLoading,
  user,
  userProfile,
  onSendMessage,
  onShowAuthModal,
  onRetryMessage
}) => {
  const chatInputRef = useRef<ChatInputRef>(null);

  // Header component for the mobile layout
  const header = (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img 
            src="/apple-touch-icon.png" 
            alt="Q0 Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Q0 Chat
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        {user ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        ) : (
          <button 
            onClick={onShowAuthModal}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );

  return (
    <MobileChatLayout
      header={header}
      onSendMessage={onSendMessage}
      disabled={isLoading}
      user={user}
      onShowAuthModal={onShowAuthModal}
      isLoading={isLoading}
    >
      {/* Message List */}
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-gray-400 py-8">
          Let's have a chat!
        </div>
      )}
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        user={user}
        userProfile={userProfile}
        onRetryMessage={onRetryMessage}
      />
    </MobileChatLayout>
  );
};

export default MobileChatExample; 