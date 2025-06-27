import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatHeaderProps {
  onNewChat: () => void;
  onSignIn?: () => void;
  user?: any;
  onSignOut?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onSignIn, user, onSignOut }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="glass-card rounded-xl p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          AuravoxAI
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg">
                  <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
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
        <Link to="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/20 dark:hover:bg-gray-700/50"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
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
    </div>
  );
};
