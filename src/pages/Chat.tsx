import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ChatLayout from '../components/ChatLayout';
import { useChatHistory } from '../hooks/useChatHistory';
import { useMessages } from '../hooks/useMessages';

const Chat = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    user && currentConversationId ? saveMessage : undefined
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingConversation, setRenamingConversation] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState<any>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archivingConversation, setArchivingConversation] = useState<any>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // If no current conversation, create one
    if (!currentConversationId && user) {
      const conversation = await createConversation(content.substring(0, 50) + '...');
      if (conversation) {
        setCurrentConversationId(conversation.id);
      }
    }

    // Add message to UI and handle AI response
    await addMessage(content);

    // Update conversation title with first message if it's still "New Chat"
    if (currentConversationId && user) {
      const currentConversation = conversations.find(c => c.id === currentConversationId);
      if (currentConversation && currentConversation.title === 'New Chat') {
        await updateConversationTitle(currentConversationId, content.substring(0, 50) + '...');
      }
    }
  };

  const handleNewChat = async () => {
    // If a conversation with title 'New Chat' exists, select it
    const existingNewChat = conversations.find(c => c.title === 'New Chat');
    if (existingNewChat) {
      setCurrentConversationId(existingNewChat.id);
      clearMessages();
      return;
    }
    // Only allow new chat if there is at least one message in the current conversation
    if (!messages || messages.length === 0) return;
    clearMessages();
    if (user) {
      const conversation = await createConversation();
      if (conversation) {
        setCurrentConversationId(conversation.id);
      }
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    if (user) {
      setCurrentConversationId(conversationId);
      const conversationMessages = await loadMessages(conversationId);
      
      // Convert ChatMessage format to Message format for the UI
      const uiMessages = conversationMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        created_at: msg.created_at
      }));
      
      // Update the messages in the UI
      setMessagesDirectly(uiMessages);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setDeletingConversation(conversation);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingConversation && user) {
      await deleteConversation(deletingConversation.id);
      if (currentConversationId === deletingConversation.id) {
        clearMessages();
      }
      setShowDeleteDialog(false);
      setDeletingConversation(null);
    }
  };

  const handleUpdateConversationTitle = async (conversationId: string, title: string) => {
    if (user) {
      await updateConversationTitle(conversationId, title);
    }
  };

  const handleShareConversation = async (conversationId: string) => {
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
  };

  const handleArchiveConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setArchivingConversation(conversation);
      setShowArchiveDialog(true);
    }
  };

  const handleConfirmArchive = async () => {
    if (archivingConversation && user) {
      // For now, we'll just delete the conversation
      // In a real app, you'd have an archive table or status field
      await deleteConversation(archivingConversation.id);
      if (currentConversationId === archivingConversation.id) {
        clearMessages();
      }
      setShowArchiveDialog(false);
      setArchivingConversation(null);
    }
  };

  const handleRenameConversation = (conversation: any) => {
    setRenamingConversation(conversation);
    setNewTitle(conversation.title || '');
    setShowRenameDialog(true);
  };

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
  };

  const handleSignUp = () => {
    setShowAuthModal(true);
    setAuthMode('sign-up');
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
    if (authMode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else setShowAuthModal(false);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setShowVerifyEmail(true);
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
      onArchiveConversation={handleArchiveConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="h-full flex flex-col p-4 max-w-6xl mx-auto w-full">
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-0 max-w-md">
              {showVerifyEmail ? (
                <div className="flex flex-col items-center text-center py-8 px-8">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="16" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                        <rect x="7.5" y="2" width="7" height="4" rx="2" fill="white" fillOpacity="0.7"/>
                        <circle cx="7.5" cy="11" r="1.2" fill="#6366F1"/>
                        <circle cx="14.5" cy="11" r="1.2" fill="#6366F1"/>
                        <rect x="9.5" y="15" width="3" height="1.2" rx="0.6" fill="#6366F1"/>
                        <rect x="2" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                        <rect x="18" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Verify your email</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We've sent a verification link to <span className="font-medium">{email}</span>.<br />
                    Please check your inbox and click the link to activate your account.
                  </p>
                  <Button onClick={() => { setShowVerifyEmail(false); setAuthMode('sign-in'); }} variant="ghost" className="mt-2">
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center px-8 py-8">
                  {/* Logo/Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="16" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                        <rect x="7.5" y="2" width="7" height="4" rx="2" fill="white" fillOpacity="0.7"/>
                        <circle cx="7.5" cy="11" r="1.2" fill="#6366F1"/>
                        <circle cx="14.5" cy="11" r="1.2" fill="#6366F1"/>
                        <rect x="9.5" y="15" width="3" height="1.2" rx="0.6" fill="#6366F1"/>
                        <rect x="2" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                        <rect x="18" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                      </svg>
                    </div>
                  </div>
                  <DialogHeader className="w-full">
                    <DialogTitle className="text-2xl font-bold text-center mb-1">
                      {authMode === 'sign-in' ? 'Sign in to AuravoxAI' : 'Create your AuravoxAI account'}
                    </DialogTitle>
                    <DialogDescription className="text-center mb-4 text-base text-gray-500 dark:text-gray-400">
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
                    <Button type="submit" className="w-full h-12 text-base font-semibold mt-2">
                      {authMode === 'sign-in' ? 'Sign in' : 'Sign up'}
                    </Button>
                  </form>
                  <div className="flex items-center w-full my-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    <span className="mx-3 text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <Button onClick={handleGoogleSignIn} className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2" variant="outline" type="button">
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
              <div className="flex flex-col items-center px-8 py-8">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-xl font-bold text-center mb-1">
                    Rename Conversation
                  </DialogTitle>
                  <DialogDescription className="text-center mb-4 text-base text-gray-500 dark:text-gray-400">
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
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-12 text-base font-semibold"
                      onClick={() => setShowRenameDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 text-base font-semibold"
                      disabled={!newTitle.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-0 max-w-md">
              <div className="flex flex-col items-center px-8 py-8">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-xl font-bold text-center mb-1 text-red-600">
                    Delete Conversation
                  </DialogTitle>
                  <DialogDescription className="text-center mb-4 text-base text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete "{deletingConversation?.title || 'Untitled Chat'}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 text-base font-semibold"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1 h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Archive Confirmation Dialog */}
          <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <DialogContent className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-0 max-w-md">
              <div className="flex flex-col items-center px-8 py-8">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-xl font-bold text-center mb-1">
                    Archive Conversation
                  </DialogTitle>
                  <DialogDescription className="text-center mb-4 text-base text-gray-500 dark:text-gray-400">
                    Are you sure you want to archive "{archivingConversation?.title || 'Untitled Chat'}"? This will remove it from your chat history.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 text-base font-semibold"
                    onClick={() => setShowArchiveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1 h-12 text-base font-semibold"
                    onClick={handleConfirmArchive}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="max-w-3xl mx-auto h-full flex flex-col w-full">
              <div className="flex-1 overflow-y-auto min-h-0">
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading}
                  user={user}
                />
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-4">
                <ChatInput 
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
};

export default Chat;
