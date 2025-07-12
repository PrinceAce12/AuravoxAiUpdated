import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput, ChatInputRef } from '../components/chat/ChatInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/lib/auth';
import ChatLayout from '../components/ChatLayout';
import { useChatHistory } from '../hooks/useChatHistory';
import { useMessages } from '../hooks/useMessages';
import { useUserProfile } from '../hooks/useUserProfile';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
  };
  avatar_url?: string;
}

interface Conversation {
  id: string;
  title?: string;
}

const Chat = memo(() => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use the optimized user profile hook
  const { userProfile } = useUserProfile(user);

  // Chat history functionality
  const {
    conversations,
    currentConversationId,
    isLoading: historyLoading,
    createConversation,
    loadMessages,
    saveMessage,
    updateConversationTitle,
    deleteConversation,
    setCurrentConversationId,
    setConversations,
  } = useChatHistory(user?.id);

  const { messages, addMessage, clearMessages, setMessagesDirectly, isLoading } = useMessages(
    user ? saveMessage : undefined
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingConversation, setRenamingConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState<Conversation | null>(null);

  // Memoize current conversation
  const currentConversation = useMemo(() => {
    return conversations.find(c => c.id === currentConversationId);
  }, [conversations, currentConversationId]);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    // Only auto-scroll if we're near the bottom or if it's a new message
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      const isNewMessage = messages.length > 0;
      
      if (isNearBottom || isNewMessage) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      }
    }
  }, [messages, scrollToBottom]);

  // Force scroll to bottom when user sends a message
  const handleSendMessage = useCallback(async (content: string) => {
    // Add message to UI and handle AI response
    // The saveMessage function will automatically create a conversation if needed
    await addMessage(content);

    // Force scroll to bottom immediately after sending
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // Focus the input field after sending
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 150);

    // Update conversation title with first message if it's still "New Chat"
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConversationId && user && currentConv?.title === 'New Chat') {
      await updateConversationTitle(currentConversationId, content.substring(0, 50) + '...');
    }
  }, [currentConversationId, user, addMessage, conversations, updateConversationTitle, scrollToBottom]);

  // Handle retrying a user message (move to bottom)
  const handleRetryMessage = useCallback(async (messageId: string) => {
    // Find the message to retry
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry || messageToRetry.role !== 'user') return;

    // Find the index of the user message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Check if there's an AI response immediately after this user message
    const nextMessageIndex = messageIndex + 1;
    const nextMessage = messages[nextMessageIndex];
    
    let updatedMessages;
    if (nextMessage && nextMessage.role === 'assistant') {
      // Remove the user message and its AI response from their current position
      updatedMessages = [
        ...messages.slice(0, messageIndex), // Keep all messages before the user message
        ...messages.slice(nextMessageIndex + 1)  // Keep all messages after the AI response
      ];
    } else {
      // No AI response, just remove the user message from its current position
      updatedMessages = [
        ...messages.slice(0, messageIndex), // Keep all messages before the user message
        ...messages.slice(messageIndex + 1)  // Keep all messages after the user message
      ];
    }
    
    setMessagesDirectly(updatedMessages);

    // Resend the message to get a new AI response at the bottom
    await handleSendMessage(messageToRetry.content);
  }, [messages, setMessagesDirectly, handleSendMessage]);

  const handleNewChat = useCallback(async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      setAuthMode('sign-in');
      return;
    }

    // Clear current messages first
    clearMessages();
    
    // If a conversation with title 'New Chat' exists, select it
    const existingNewChat = conversations.find(c => c.title === 'New Chat');
    if (existingNewChat) {
      setCurrentConversationId(existingNewChat.id);
      return;
    }
    
    // Create a new conversation regardless of current message state
    const conversation = await createConversation();
    if (conversation) {
      setCurrentConversationId(conversation.id);
    }
  }, [conversations, setCurrentConversationId, clearMessages, user, createConversation, setShowAuthModal, setAuthMode]);

  const handleSelectConversation = useCallback(async (conversationId: string) => {
    // Clear current messages first to prevent UI flicker
    clearMessages();
    
    // Set the conversation ID
    setCurrentConversationId(conversationId);
    
    // Load messages for the selected conversation
    try {
      const conversationMessages = await loadMessages(conversationId);
      // Convert ChatMessage format to Message format for the UI
      const uiMessages = conversationMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        created_at: msg.created_at
      }));
      setMessagesDirectly(uiMessages);
    } catch (error) {
      console.error('Error loading messages for conversation:', conversationId, error);
      // If loading fails, ensure messages are cleared
      setMessagesDirectly([]);
    }
  }, [setCurrentConversationId, loadMessages, setMessagesDirectly, clearMessages]);

  const handleDeleteConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setDeletingConversation(conversation);
      setShowDeleteDialog(true);
    }
  }, [conversations]);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingConversation) {
      await deleteConversation(deletingConversation.id);
      if (currentConversationId === deletingConversation.id) {
        clearMessages();
      }
      setShowDeleteDialog(false);
      setDeletingConversation(null);
    }
  }, [deletingConversation, deleteConversation, currentConversationId, clearMessages]);

  const handleUpdateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    if (user) {
      await updateConversationTitle(conversationId, title);
    }
  }, [user, updateConversationTitle]);

  const handleShareConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        const shareData = {
          title: conversation.title || 'Untitled Chat',
          text: `Check out this conversation: ${conversation.title || 'Untitled Chat'}`,
          url: `${window.location.origin}/chat?share=${conversationId}`
        };
        
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareData.url);
          // You could add a toast notification here
          alert('Conversation link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Error sharing conversation:', error);
    }
  }, [conversations]);

  const handleRenameConversation = useCallback((conversation: Conversation) => {
    setRenamingConversation(conversation);
    setNewTitle(conversation.title || '');
    setShowRenameDialog(true);
  }, []);

  const handleSaveRename = async () => {
    if (renamingConversation && newTitle.trim()) {
      await handleUpdateConversationTitle(renamingConversation.id, newTitle.trim());
      setShowRenameDialog(false);
      setRenamingConversation(null);
      setNewTitle('');
    }
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
    setAuthMode('sign-in');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAuthError(null);
  };

  const handleSignUp = () => {
    setShowAuthModal(true);
    setAuthMode('sign-up');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAuthError(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearMessages();
    // Immediately clear chat history UI
    setCurrentConversationId(null);
    if (typeof setConversations === 'function') setConversations([]);
  };

  const handleAuth = async () => {
    setAuthError(null);
    
    // Validate passwords match for sign-up
    if (authMode === 'sign-up' && password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    
    // Validate password length for sign-up
    if (authMode === 'sign-up' && password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    
    if (authMode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else setShowAuthModal(false);
    } else {
      // Use AuthService for proper email verification handling
      const { user, error, requiresVerification } = await AuthService.signUpWithEmail(email, password);
      if (error) {
        setAuthError(error.message);
      } else if (requiresVerification) {
        // Show email verification screen
        setShowVerifyEmail(true);
      } else if (user) {
        // User is immediately available (rare case)
        setShowAuthModal(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setAuthError(error.message);
  };

  return (
    <ChatLayout
      onNewChat={handleNewChat}
      onSignIn={handleSignIn}
      user={user}
      onSignOut={handleSignOut}
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
      selectedConversationId={currentConversationId}
      onSidebarStateChange={setSidebarOpen}
      onShareConversation={handleShareConversation}
      onRenameConversation={handleRenameConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="h-full flex flex-col p-4 max-w-6xl mx-auto w-full">
          <Dialog open={showAuthModal} onOpenChange={(open) => {
            setShowAuthModal(open);
            if (!open) {
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setAuthError(null);
            }
          }}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-0 max-w-md">
              {showVerifyEmail ? (
                <div className="flex flex-col items-center text-center py-6 sm:py-8 px-6 sm:px-8">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src="/apple-touch-icon.png" 
                        alt="Q0 Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-2">Verify your email</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                    We've sent a verification link to <span className="font-medium">{email}</span>.<br />
                    Please check your inbox and click the link to activate your account.
                  </p>
                  <Button onClick={() => { setShowVerifyEmail(false); setAuthMode('sign-in'); }} variant="ghost" className="mt-2 touch-manipulation">
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 sm:px-8 py-6 sm:py-8">
                  {/* Logo/Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src="/apple-touch-icon.png" 
                        alt="Q0 Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <DialogHeader className="w-full">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-center mb-1">
                      {authMode === 'sign-in' ? 'Sign in to Q0' : 'Create your Q0 account'}
                    </DialogTitle>
                    <DialogDescription className="text-center mb-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                      {authMode === 'sign-in' ? 'Welcome back! Please sign in to your account.' : 'Get started with your free account.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form className="w-full flex flex-col gap-4 mt-5" onSubmit={e => { e.preventDefault(); handleAuth(); }}>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      className="h-12 text-base px-4 border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                      className="h-12 text-base px-4 border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                    />
                    {authMode === 'sign-up' && (
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="h-12 text-base px-4 border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                      />
                    )}
                    <Button type="submit" className="w-full h-12 text-base font-semibold mt-2 touch-manipulation">
                      {authMode === 'sign-in' ? 'Sign in' : 'Sign up'}
                    </Button>
                  </form>
                  <div className="flex items-center w-full my-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    <span className="mx-3 text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <Button onClick={handleGoogleSignIn} className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2 touch-manipulation" variant="outline" type="button">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.82 2.68 30.28 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.19C12.13 13.13 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.28a14.6 14.6 0 0 1 0-8.56l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.47l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.28 0 11.56-2.08 15.41-5.66l-7.19-5.6c-2.01 1.35-4.6 2.15-8.22 2.15-6.43 0-11.87-3.63-13.33-8.53l-7.98 6.19C6.73 42.2 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                    Continue with Google
                  </Button>
                  <div className="text-xs text-center text-gray-500 mt-4">
                    {authMode === 'sign-in' ? (
                      <>Don't have an account? <button className="underline font-medium" onClick={handleSignUp}>Sign up</button></>
                    ) : (
                      <>Already have an account? <button className="underline font-medium" onClick={handleSignIn}>Sign in</button></>
                    )}
                  </div>
                  {authError && <div className="text-xs text-red-500 text-center mt-2">{authError}</div>}
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Rename Dialog */}
          <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-0 max-w-md">
              <div className="flex flex-col items-center px-6 sm:px-8 py-6 sm:py-8">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-center mb-1">
                    Rename Conversation
                  </DialogTitle>
                  <DialogDescription className="text-center mb-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    Enter a new name for this conversation
                  </DialogDescription>
                </DialogHeader>
                <form className="w-full flex flex-col gap-4 mt-5" onSubmit={e => { e.preventDefault(); handleSaveRename(); }}>
                  <Input
                    type="text"
                    placeholder="Conversation name"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="h-12 text-base px-4 border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-12 text-base font-semibold touch-manipulation"
                      onClick={() => setShowRenameDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 text-base font-semibold touch-manipulation"
                      disabled={!newTitle.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border-0 p-0 max-w-md">
              <div className="flex flex-col">
                <div className="flex items-center justify-center p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-b border-red-100 dark:border-red-800/30">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="px-6 sm:px-8 py-6">
                  <DialogHeader className="text-center mb-6">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Delete Conversation
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deletingConversation?.title || 'Untitled Chat'}"</span>?
                    </DialogDescription>
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This action cannot be undone. All messages and conversation history will be permanently deleted.
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-12 text-base font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 touch-manipulation"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      className="flex-1 h-12 text-base font-medium bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm touch-manipulation"
                      onClick={handleConfirmDelete}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Conversation
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="max-w-4xl mx-auto h-full flex flex-col w-full px-3 sm:px-4">
              <div className="flex-1 overflow-y-auto min-h-0">
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
                  onRetryMessage={handleRetryMessage}
                />
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-2 sm:mt-6 pb-2 sm:pb-6">
                <ChatInput 
                  ref={chatInputRef}
                  onSendMessage={handleSendMessage} 
                  disabled={isLoading} 
                  user={user}
                  onShowAuthModal={handleSignIn}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
});

export default Chat;
