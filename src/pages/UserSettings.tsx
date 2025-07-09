import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ChatLayout from '@/components/ChatLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Archive, MessageSquare, Calendar, RotateCcw, Trash2, ArrowLeft, User, Palette, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
  };
  avatar_url?: string;
}

interface Profile {
  id?: string;
  full_name: string;
  email: string;
  avatar_url: string;
  updated_at?: string;
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

interface UserSettingsProps {
  modal?: boolean;
  onProfileUpdate?: () => void;
  onClose?: () => void;
}

// Profile Section Component
const ProfileSection: React.FC<{
  profile: Profile;
  user: User | null;
  pendingAvatarUrl: string | null;
  uploading: boolean;
  uploadError: string | null;
  saving: boolean;
  saveError: string | null;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: () => void;
}> = ({
  profile,
  user,
  pendingAvatarUrl,
  uploading,
  uploadError,
  saving,
  saveError,
  onProfileChange,
  onAvatarUpload,
  onSaveProfile
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <User className="w-5 h-5 text-indigo-600" />
      <h2 className="text-xl font-semibold">Profile</h2>
    </div>
    
    <div className="flex items-start gap-6">
      <Avatar className="w-20 h-20 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
        <AvatarImage 
          src={pendingAvatarUrl || profile.avatar_url} 
          alt={profile.full_name || 'User'} 
        />
        <AvatarFallback className="text-lg font-semibold">
          {(profile.full_name || user?.email || 'U')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-4">
        <div>
          <Label htmlFor="avatar-upload" className="text-sm font-medium">
            Profile Picture
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onAvatarUpload}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 transition-colors"
            disabled={uploading}
            aria-label="Upload profile picture"
          />
          {/* Image preview */}
          {pendingAvatarUrl && (
            <div className="mt-2">
              <img src={pendingAvatarUrl} alt="Preview" className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-700 object-cover" />
              <p className="text-xs text-gray-500 mt-1">Preview</p>
            </div>
          )}
          {uploading && (
            <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-600"></div>
              Uploading...
            </div>
          )}
          {uploadError && (
            <div className="text-xs text-red-500 mt-1">{uploadError}</div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={profile.full_name}
              onChange={onProfileChange}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              readOnly
              placeholder="your.email@example.com"
              className="mt-1 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              aria-readonly="true"
              tabIndex={-1}
            />
            <p className="text-xs text-gray-500 mt-1" id="email-helper">
              This is your login email and cannot be changed here.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onSaveProfile} 
          disabled={saving}
          className="w-full md:w-auto bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          aria-label="Save profile"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-600 dark:border-gray-400"></div>
              Saving...
            </div>
          ) : (
            'Save Profile'
          )}
        </Button>
        
        {saveError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {saveError}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Theme Section Component
const ThemeSection: React.FC<{
  theme: string;
  onThemeChange: (theme: string) => void;
}> = ({ theme, onThemeChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Palette className="w-5 h-5 text-indigo-600" />
      <h2 className="text-xl font-semibold">Theme</h2>
    </div>
    
    <div>
      <Label htmlFor="theme-select" className="text-sm font-medium">
        Choose your preferred theme
      </Label>
      <Select value={theme} onValueChange={onThemeChange}>
        <SelectTrigger className="mt-1">
          <span className="capitalize">{theme}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

// Account Section Component
const AccountSection: React.FC<{
  onSignOut: () => void;
}> = ({ onSignOut }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Settings className="w-5 h-5 text-indigo-600" />
      <h2 className="text-xl font-semibold">Account</h2>
    </div>
    
    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
        Sign out of your account
      </p>
      <Button 
        onClick={onSignOut}
        className="flex items-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0 text-red-600 hover:text-red-700"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  </div>
);

// Conversation Item Component
const ConversationItem: React.FC<{
  conversation: Conversation;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  deletingConversationId: string | null;
}> = ({ conversation, onRestore, onDelete, deletingConversationId }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {conversation.title || 'Untitled Chat'}
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(conversation.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRestore(conversation.id)}
        className="flex items-center gap-1"
        aria-label={`Restore conversation ${conversation.title || conversation.id}`}
      >
        <RotateCcw className="w-3 h-3" />
        Restore
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(conversation.id)}
        className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        aria-label={`Delete conversation ${conversation.title || conversation.id}`}
        disabled={deletingConversationId === conversation.id}
      >
        {deletingConversationId === conversation.id ? (
          <span className="flex items-center gap-1"><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></span>Deleting...</span>
        ) : (
          <>
            <Trash2 className="w-3 h-3" />
            Delete
          </>
        )}
      </Button>
    </div>
  </div>
);

// Main Component
const UserSettings: React.FC<UserSettingsProps> = ({ modal = false, onProfileUpdate, onClose }) => {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    avatar_url: '',
  });
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user and profile data
  useEffect(() => {
    const loadUserAndProfile = async () => {
      try {
        setLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!user) {
          navigate('/chat');
          return;
        }
        
        setUser(user);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError);
        }
        
        if (profileData) {
          setProfile({
            id: profileData.id,
            full_name: profileData.full_name || '',
            email: profileData.email || user.email || '',
            avatar_url: profileData.avatar_url || '',
            updated_at: profileData.updated_at,
          });
        } else {
          setProfile({
            full_name: '',
            email: user.email || '',
            avatar_url: '',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setSaveError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndProfile();
  }, [navigate]);

  // Event handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PNG, JPEG, or WEBP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB.');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      setPendingAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      setSaveError('You must be signed in to update your profile.');
      return;
    }
    
    setSaveError(null);
    setSaving(true);
    
    try {
      const updates = {
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: pendingAvatarUrl || profile.avatar_url,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert([updates], { onConflict: 'id' });
      
      if (error) throw error;
      
      setProfile(prev => ({ 
        ...prev, 
        avatar_url: pendingAvatarUrl || prev.avatar_url 
      }));
      setPendingAvatarUrl(null);
      
      // Notify parent component that profile was updated
      onProfileUpdate?.();
      toast({
        title: 'Profile updated',
        description: 'Your profile changes have been saved.',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/chat');
    onClose?.();
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleSignIn = () => {
    navigate('/chat');
  };

  // Loading state
  if (loading) {
    return modal ? (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    ) : (
      <ChatLayout
        onNewChat={handleNewChat}
        onSignIn={handleSignIn}
        user={user}
        onSignOut={handleSignOut}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </ChatLayout>
    );
  }

  // Modal view
  if (modal) {
    return (
      <Dialog open={true} onOpenChange={(open) => { if (!open) onClose?.(); }}>
        <DialogContent
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full p-0 sm:p-0"
        >
          <div className="flex flex-col h-full">
            <DialogHeader className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">User Settings</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Manage your profile, preferences, and theme
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1">
              <div
                className="space-y-8 p-6"
                style={{
                  maxHeight: 'calc(80vh - 120px)', // adjust as needed for header height
                  overflowY: 'auto'
                }}
              >
                <ProfileSection
                  profile={profile}
                  user={user}
                  pendingAvatarUrl={pendingAvatarUrl}
                  uploading={uploading}
                  uploadError={uploadError}
                  saving={saving}
                  saveError={saveError}
                  onProfileChange={handleProfileChange}
                  onAvatarUpload={handleAvatarUpload}
                  onSaveProfile={handleSaveProfile}
                />
                <ThemeSection theme={theme} onThemeChange={setTheme} />
                <AccountSection onSignOut={handleSignOut} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full page view
  return (
    <ChatLayout
      onNewChat={handleNewChat}
      onSignIn={handleSignIn}
      user={user}
      onSignOut={handleSignOut}
    >
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Back to Chat"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Chat
            </Button>
          </div>
          
          <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    User Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your profile, preferences, and account settings
                  </CardDescription>
                </div>
                <Avatar className="w-12 h-12 shadow-lg">
                  <AvatarImage src={pendingAvatarUrl || profile.avatar_url} alt={profile.full_name || user?.email || 'User'} />
                  <AvatarFallback className="text-lg">{(profile.full_name || user?.email || 'U')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            
            <CardContent
              className="p-8 space-y-12"
              style={{
                maxHeight: 'calc(100vh - 220px)', // adjust as needed for header+padding
                overflowY: 'auto'
              }}
            >
              <ProfileSection
                profile={profile}
                user={user}
                pendingAvatarUrl={pendingAvatarUrl}
                uploading={uploading}
                uploadError={uploadError}
                saving={saving}
                saveError={saveError}
                onProfileChange={handleProfileChange}
                onAvatarUpload={handleAvatarUpload}
                onSaveProfile={handleSaveProfile}
              />
              
              <ThemeSection theme={theme} onThemeChange={setTheme} />
              
              <AccountSection onSignOut={handleSignOut} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ChatLayout>
  );
};

export default UserSettings; 