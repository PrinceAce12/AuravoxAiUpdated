import React, { useState, useEffect } from 'react';
import { useTheme } from './providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Settings, Moon, Sun, PanelLeft, MoreVertical, Share, Edit2, Archive, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const SIDEBAR_COLLAPSED = 'w-16';
const SIDEBAR_EXPANDED = 'w-64';

interface ChatLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
  onSignIn?: () => void;
  user?: any;
  onSignOut?: () => void;
  conversations?: any[];
  onSelectConversation?: (id: string) => void;
  selectedConversationId?: string;
  onSidebarStateChange?: (isOpen: boolean) => void;
}

export default function ChatLayout({ children, onNewChat, onSignIn, user, onSignOut, conversations = [], onSelectConversation, selectedConversationId, onSidebarStateChange }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toggleHover, setToggleHover] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Theme-aware classes
  const sidebarBg = theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const sidebarHover = theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100';
  const sidebarButton = theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200';

  // Notify parent component of sidebar state changes
  useEffect(() => {
    onSidebarStateChange?.(sidebarOpen);
  }, [sidebarOpen, onSidebarStateChange]);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`h-full flex flex-col transition-all duration-300 ease-in-out border-r border-transparent shadow-sm ${sidebarBg} ${sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED}`}
      >
        <div className="flex flex-row items-start justify-between px-2 pt-2 pb-1">
          {sidebarOpen && (
            <div className="w-6 h-6 rounded-lg mt-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="16" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                <rect x="7.5" y="2" width="7" height="4" rx="2" fill="white" fillOpacity="0.7"/>
                <circle cx="7.5" cy="11" r="1.2" fill="#6366F1"/>
                <circle cx="14.5" cy="11" r="1.2" fill="#6366F1"/>
                <rect x="9.5" y="15" width="3" height="1.2" rx="0.6" fill="#6366F1"/>
                <rect x="2" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="18" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
          )}
          {/* Toggle Button */}
          <button
            className={`w-8 h-8 flex items-center justify-center transition-colors duration-200 group mt-0 ml-2`}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            tabIndex={0}
            onMouseEnter={() => setToggleHover(true)}
            onMouseLeave={() => setToggleHover(false)}
          >
            {sidebarOpen || toggleHover ? (
              <PanelLeft className="w-5 h-5 text-gray-400" />
            ) : (
              <div className="w-5 h-5 rounded bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="16" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                  <rect x="7.5" y="2" width="7" height="4" rx="2" fill="white" fillOpacity="0.7"/>
                  <circle cx="7.5" cy="11" r="1.2" fill="#6366F1"/>
                  <circle cx="14.5" cy="11" r="1.2" fill="#6366F1"/>
                  <rect x="9.5" y="15" width="3" height="1.2" rx="0.6" fill="#6366F1"/>
                  <rect x="2" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="18" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                </svg>
              </div>
            )}
          </button>
        </div>
        {/* Sidebar content */}
        <div className={`flex-1 flex flex-col px-2 py-4 space-y-6 transition-all duration-200`}>
          {/* New Chat Button */}
          <div>
            <button
              className={`w-full py-2 px-3 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 font-medium`}
              onClick={onNewChat}
              disabled={conversations.length === 0}
              style={{ background: 'none', boxShadow: 'none' }}
            >
              <MessageSquarePlus className={`w-5 h-5${sidebarOpen ? ' mr-2' : ''}`} />
              {sidebarOpen && 'New Chat'}
            </button>
          </div>
          {/* Chat History Section */}
          {sidebarOpen && (
            <div>
              <div className="uppercase text-xs font-semibold tracking-wider mb-2 opacity-70">Chat History</div>
              <ul
                className={`space-y-1 ${conversations.length > 5 ? 'max-h-60 overflow-y-auto pr-1 custom-scrollbar' : ''}`}
                style={{ maxHeight: conversations.length > 5 ? undefined : 'none' }}
              >
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <li key={conv.id} className="group flex items-center">
                      <button
                        className={`flex-1 text-left py-2 px-3 rounded ${sidebarHover} transition-colors flex items-center ${selectedConversationId === conv.id ? 'bg-blue-100 dark:bg-gray-800 font-semibold' : ''}`}
                        onClick={() => onSelectConversation && onSelectConversation(conv.id)}
                      >
                        {conv.title || 'Untitled Chat'}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="w-4 h-4 mr-2" /> Delete
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
        <div className="border-t pt-4 pb-4 px-4 opacity-80 mt-0">
          <div className="text-xs font-semibold mb-1">Plan</div>
          <div className="text-sm font-medium">Free Plan</div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header with avatar and user menu */}
        <header className="h-12 flex items-center px-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10 border-b border-transparent shadow-sm">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              AuravoxAI
            </h1>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar
                      className={`w-7 h-7 rounded-full shadow-md border-2 ${
                        theme === 'dark'
                          ? 'border-gray-700 bg-gray-900'
                          : 'border-gray-200 bg-white'
                      } flex items-center justify-center`}
                    >
                      <AvatarFallback
                        className={`w-full h-full flex items-center justify-center rounded-full font-semibold text-base ${
                          theme === 'dark'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNewChat}>New Chat</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-white/20 dark:hover:bg-gray-700/50"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="hover:bg-white/20 dark:hover:bg-gray-700/50"
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
                {user && (
                  <Link to="/settings">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/20 dark:hover:bg-gray-700/50"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
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
    </div>
  );
} 