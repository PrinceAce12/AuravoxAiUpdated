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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const USER_PROFILE_KEY = 'user_profile';

const defaultProfile = {
  avatar_url: '',
  full_name: '',
  email: '',
};

const getAvatarUrl = (userId: string, ext: string = 'png') =>
  `https://iwtdbchibdhnhpstrrod.supabase.co/storage/v1/object/public/avatars/${userId}.${ext}`;

const UserSettings: React.FC = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      const publicUrl = `https://iwtdbchibdhnhpstrrod.supabase.co/storage/v1/object/public/avatars/${fileName}`;
      setPendingAvatarUrl(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaving(true);
    if (!user) {
      setSaveError('You must be signed in to update your profile.');
      setSaving(false);
      return;
    }
    const updates = {
      id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: pendingAvatarUrl || profile.avatar_url,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').upsert([updates], { onConflict: 'id' });
    if (error) {
      setSaveError(error.message);
    } else {
      setProfile(prev => ({ ...prev, avatar_url: pendingAvatarUrl || prev.avatar_url }));
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({ ...profile, avatar_url: pendingAvatarUrl || profile.avatar_url }));
      setPendingAvatarUrl(null);
    }
    setSaving(false);
  };

  const userId = user?.id;
  const avatarUrl = getAvatarUrl(userId, 'png');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <Card className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl border border-indigo-700">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-white font-medium flex items-center"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Back
            </button>
            <Avatar className="w-9 h-9">
              <AvatarImage src={avatarUrl} alt={user?.email || 'User'} />
              <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-700">User Settings</CardTitle>
          <CardDescription className="text-gray-400 mt-2">Manage your profile, preferences, and theme.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Profile</h2>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={pendingAvatarUrl || profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                <AvatarFallback>{profile.full_name ? profile.full_name[0] : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={uploading}
                />
                {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
                {uploadError && <div className="text-xs text-red-500">{uploadError}</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            {saveError && <div className="text-xs text-red-500 mt-2">{saveError}</div>}
          </div>

          {/* Theme Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Theme</h2>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full" />
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferences Section (expandable) */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Preferences</h2>
            <p className="text-gray-500 text-sm mb-2">More preferences coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings; 