import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from './providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Settings, Moon, Sun, PanelLeft, MoreHorizontal, Share, Edit2, Archive, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import UserSettings from '@/pages/UserSettings';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const SIDEBAR_COLLAPSED = 'w-16';
const SIDEBAR_EXPANDED = 'w-64';
const SIDEBAR_MOBILE = 'w-full';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
  avatar_url?: string;
}

interface Conversation {
  id: string;
  title?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
  onSignIn?: () => void;
  user?: User | null;
  onSignOut?: () => void;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  selectedConversationId?: string;
  onSidebarStateChange?: (isOpen: boolean) => void;
  onShareConversation?: (id: string) => void;
  onRenameConversation?: (conversation: Conversation) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onProfileUpdate?: () => void;
}

export default function ChatLayout({ children, onNewChat, onSignIn, user, onSignOut, conversations = [], onSelectConversation, selectedConversationId, onSidebarStateChange, onShareConversation, onRenameConversation, onArchiveConversation, onDeleteConversation, onProfileUpdate }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toggleHover, setToggleHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme-aware classes
  const sidebarBg = theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const sidebarHover = theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100';
  const sidebarButton = theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200';

  // Load user profile data
  const loadUserProfile = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Handle settings dialog close
  const handleSettingsClose = (open: boolean) => {
    setShowSettings(open);
    if (!open) {
      // Refresh profile data when settings are closed
      loadUserProfile();
      onProfileUpdate?.();
    }
  };

  // Notify parent component of sidebar state changes
  useEffect(() => {
    onSidebarStateChange?.(sidebarOpen);
  }, [sidebarOpen, onSidebarStateChange]);

  // Get avatar display info
  const getAvatarInfo = () => {
    // Check for avatar in this priority order:
    // 1. User profile avatar (from settings)
    // 2. Google OAuth avatar (from user metadata)
    // 3. Fallback to initials
    
    const avatarUrl = userProfile?.avatar_url || 
                     user?.user_metadata?.avatar_url || 
                     user?.avatar_url;
    
    const displayName = userProfile?.full_name || 
                       user?.user_metadata?.full_name || 
                       user?.email || 
                       'User';
    
    if (avatarUrl) {
      return {
        src: avatarUrl,
        fallback: displayName[0].toUpperCase(),
        alt: displayName
      };
    }
    
    return {
      src: undefined,
      fallback: displayName[0].toUpperCase(),
      alt: displayName
    };
  };

  const avatarInfo = getAvatarInfo();

  // Handle conversation selection on mobile
  const handleConversationSelect = (id: string) => {
    onSelectConversation?.(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-full flex flex-col border-r border-transparent shadow-sm ${sidebarBg} ${
          isMobile 
            ? `fixed left-0 top-0 z-50 mobile-sidebar transform transition-transform transition-opacity duration-300 ease ${sidebarOpen ? 'translate-x-0 opacity-100 w-[50vw] max-w-[50vw]' : '-translate-x-full opacity-0 w-[50vw] max-w-[50vw]'}`
            : 'transition-all duration-300 ease-in-out'
        } ${
          isMobile ? '' : 'relative'
        }`}
        style={
          !isMobile
            ? { width: sidebarOpen ? '16rem' : '4rem' }
            : undefined
        }
      >
        {/* Sidebar header */}
        <div className={`flex items-center h-12 sm:h-14 ${(!isMobile && !sidebarOpen) ? 'justify-start items-center mr-2 sm:mr-3 md:mr-2 lg:mr-5' : 'justify-between px-4'}`}>
          {/* Logo/Icon (show only if sidebarOpen on desktop, always on mobile) */}
          {((!isMobile && sidebarOpen) || isMobile) ? (
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src="/apple-touch-icon.png" 
                alt="Q0 Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6" />
          )}
          {/* Toggle Button (always right) */}
          {(!isMobile || (isMobile && sidebarOpen)) && (
            <button
              className={`w-8 h-8 flex items-center justify-center transition-colors duration-200 group`}
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              tabIndex={0}
              onMouseEnter={() => setToggleHover(true)}
              onMouseLeave={() => setToggleHover(false)}
            >
              {sidebarOpen || toggleHover ? (
                <PanelLeft className="w-5 h-5 text-gray-400" />
              ) : (
                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                  <img 
                    src="/apple-touch-icon.png" 
                    alt="Q0 Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </button>
          )}
        </div>
        {/* Sidebar content */}
        <div className={`flex-1 flex flex-col px-2 py-4 space-y-6 transition-all duration-200`}>
          {/* New Chat Button */}
          {(!isMobile || (isMobile && sidebarOpen)) && (
            <div>
              <button
                className={`w-full py-3 px-4 rounded-lg flex items-center cursor-pointer justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 font-medium touch-manipulation`}
                onClick={onNewChat}
                style={{ background: 'none', boxShadow: 'none' }}
              >
                <MessageSquarePlus className={`w-5 h-5${sidebarOpen ? ' mr-3' : ''}`} />
                {sidebarOpen && <span className="hidden sm:inline">New Chat</span>}
                {isMobile && sidebarOpen && <span className="sm:hidden">New Chat</span>}
              </button>
            </div>
          )}
          {/* Chat History Section */}
          {sidebarOpen && (
            <div>
              <div className="uppercase text-xs font-semibold tracking-wider mb-2 px-1 opacity-70">Chat History</div>
              <ul
                className={`space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar`}
              >
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <li key={conv.id} className="group flex items-center min-w-0">
                      <DropdownMenu>
                        <button
                          className={`w-full flex items-center justify-between text-left py-2 px-3 rounded-lg min-w-0 truncate font-normal transition-colors duration-150 text-sm sm:text-base
                            ${selectedConversationId === conv.id
                              ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700'
                              : 'bg-transparent border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}
                          `}
                          onClick={() => handleConversationSelect(conv.id)}
                        >
                          <span className="truncate">
                            {conv.title || 'Untitled Chat'}
                          </span>
                          <DropdownMenuTrigger asChild>
                            <span className={`ml-2 flex items-center transition-opacity duration-150 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}> 
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </span>
                          </DropdownMenuTrigger>
                        </button>
                        <DropdownMenuContent side="right" align="start" className="w-56 sm:w-48">
                          <DropdownMenuItem onClick={() => onRenameConversation?.(conv)} className="py-3">
                            <Edit2 className="w-4 h-4 mr-3" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 py-3"
                            onClick={() => onDeleteConversation?.(conv.id)}
                          >
                            <Trash className="w-4 h-4 mr-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400 px-3 py-2">No conversations</li>
                )}
              </ul>
            </div>
          )}
        </div>
        {/* Plan Section in Footer */}
        {sidebarOpen && (
          <div className="border-t pt-4 pb-4 px-4 opacity-80 mt-0">
            <div className="text-xs font-semibold mb-1">Plan</div>
            <div className="text-sm font-medium">Free Plan</div>
          </div>
        )}
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative z-30">
        {/* Main header */}
        <header className="h-12 sm:h-14 flex items-center px-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-50 border-b border-transparent shadow-sm">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <PanelLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div className="flex items-center">
            {/* Enhanced Typewriter Animated Greeting with Backspace and Gradient */}
            {(() => {
              const greeting = "Welcome to Q0";
              const shortText = "Q0";
              const [displayText, setDisplayText] = useState(shortText);
              const [phase, setPhase] = useState('typing'); // typing, waiting, backspacing, typingShort, waitingShort
              const [cursorVisible, setCursorVisible] = useState(true);
              const intervalRef = useRef(null);
              const timeoutRef = useRef(null);

              // Determine if we should show the full greeting or just Q0
              const shouldShowFullGreeting = user || !isMobile;

              useEffect(() => {
                // Blinking cursor
                const cursorInterval = setInterval(() => {
                  setCursorVisible(v => !v);
                }, 500);
                return () => clearInterval(cursorInterval);
              }, []);

              useEffect(() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                // If not authenticated and on mobile, just show Q0 without animation
                if (!shouldShowFullGreeting) {
                  setDisplayText(shortText);
                  return;
                }

                if (phase === 'typing') {
                  let i = 0;
                  setDisplayText('');
                  intervalRef.current = setInterval(() => {
                    setDisplayText(greeting.slice(0, i + 1));
                    i++;
                    if (i === greeting.length) {
                      clearInterval(intervalRef.current);
                      timeoutRef.current = setTimeout(() => setPhase('waiting'), 1200);
                    }
                  }, 60);
                } else if (phase === 'waiting') {
                  timeoutRef.current = setTimeout(() => setPhase('backspacing'), 1200);
                } else if (phase === 'backspacing') {
                  let i = greeting.length;
                  intervalRef.current = setInterval(() => {
                    setDisplayText(greeting.slice(0, i - 1));
                    i--;
                    if (i === shortText.length) {
                      clearInterval(intervalRef.current);
                      setPhase('typingShort');
                    }
                  }, 40);
                } else if (phase === 'typingShort') {
                  let i = 0;
                  setDisplayText('');
                  intervalRef.current = setInterval(() => {
                    setDisplayText(shortText.slice(0, i + 1));
                    i++;
                    if (i === shortText.length) {
                      clearInterval(intervalRef.current);
                      timeoutRef.current = setTimeout(() => setPhase('waitingShort'), 1200);
                    }
                  }, 80);
                } else if (phase === 'waitingShort') {
                  timeoutRef.current = setTimeout(() => setPhase('typing'), 1200);
                }
                return () => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                };
              }, [phase, shouldShowFullGreeting]);

              return (
                <h1
                  className="text-lg sm:text-xl font-semibold truncate min-w-[120px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {displayText}
                </h1>
              );
            })()}
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-1 sm:space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation">
                    <Avatar
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-lg border-2 ${
                        theme === 'dark'
                          ? 'border-gray-700 bg-gray-900'
                          : 'border-gray-200 bg-white'
                      } flex items-center justify-center`}
                    >
                      <AvatarImage 
                        src={avatarInfo.src} 
                        alt={avatarInfo.alt}
                        className="object-cover"
                      />
                      <AvatarFallback
                        className={`w-full h-full flex items-center justify-center rounded-full font-semibold text-sm sm:text-base ${
                          theme === 'dark'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {avatarInfo.fallback}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 sm:w-48">
                  <DropdownMenuItem onClick={toggleTheme} className="py-3">
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNewChat} className="py-3">
                    <MessageSquarePlus className="w-4 h-4 mr-3" />
                    New Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettings(true)} className="py-3">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="py-3 text-red-600">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-white/20 dark:hover:bg-gray-700/50 w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 touch-manipulation"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="hover:bg-white/20 dark:hover:bg-gray-700/50 w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 touch-manipulation"
                >
                  <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/20 dark:hover:bg-gray-700/50 w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 touch-manipulation"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-7 sm:h-9 touch-manipulation"
                  onClick={onSignIn}
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 flex flex-col overflow-auto">
          {children}
        </div>
      </main>
      <Dialog open={showSettings} onOpenChange={handleSettingsClose}>
        <DialogContent
          className="max-w-2xl w-full p-0 bg-transparent border-0 shadow-none sm:rounded-lg sm:my-8 sm:max-h-[90vh]"
        >
          <div className="relative h-full w-full min-h-[100dvh] sm:min-h-0 sm:h-auto sm:w-auto">
            {/* Close button inside the card for settings modal */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => handleSettingsClose(false)}
              className="absolute right-4 top-4 z-10 rounded-full opacity-80 ring-offset-background transition-opacity hover:opacity-100 w-10 h-10 flex items-center justify-center sm:w-8 sm:h-8 sm:right-4 sm:top-4 right-2 top-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full w-full flex flex-col items-center justify-center sm:items-stretch sm:justify-start overflow-y-auto sm:overflow-visible">
              <UserSettings modal={true} onProfileUpdate={loadUserProfile} onClose={() => handleSettingsClose(false)} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 