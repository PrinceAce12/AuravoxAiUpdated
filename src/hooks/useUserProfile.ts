import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

// Simple in-memory cache for user profiles
const profileCache = new Map<string, UserProfile>();

export const useUserProfile = (user?: User | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }

    // Check cache first
    if (profileCache.has(user.id)) {
      setUserProfile(profileCache.get(user.id) || null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (profileData) {
        // Cache the profile
        profileCache.set(user.id, profileData);
        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Clear profile cache for a specific user
  const clearProfileCache = useCallback((userId: string) => {
    profileCache.delete(userId);
  }, []);

  // Clear all profile cache
  const clearAllProfileCache = useCallback(() => {
    profileCache.clear();
  }, []);

  // Update profile cache
  const updateProfileCache = useCallback((userId: string, profile: UserProfile) => {
    profileCache.set(userId, profile);
    if (user?.id === userId) {
      setUserProfile(profile);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    loadUserProfile,
    clearProfileCache,
    clearAllProfileCache,
    updateProfileCache,
  };
}; 