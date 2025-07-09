import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthService, AuthError, UserProfile } from '@/lib/auth';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
  };
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  // Load user profile
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { profile, error } = await AuthService.getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
        setAuthState(prev => ({ ...prev, error }));
      } else {
        setAuthState(prev => ({ ...prev, profile, error: null }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, error } = await AuthService.signInWithEmail(email, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      if (user) {
        setAuthState(prev => ({ ...prev, user, loading: false, error: null }));
        await loadUserProfile(user.id);
        return { success: true, user };
      }
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));
      return { success: false, error: authError };
    }
  }, [loadUserProfile]);

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, error, requiresVerification } = await AuthService.signUpWithEmail(email, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      // For email signup, user might not be immediately available due to email verification
      if (user) {
        setAuthState(prev => ({ ...prev, user, loading: false, error: null }));
        await loadUserProfile(user.id);
        return { success: true, user };
      } else if (requiresVerification) {
        // Email verification required
        setAuthState(prev => ({ ...prev, loading: false, error: null }));
        return { success: true, requiresVerification: true };
      } else {
        setAuthState(prev => ({ ...prev, loading: false, error: null }));
        return { success: true };
      }
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));
      return { success: false, error: authError };
    }
  }, [loadUserProfile]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await AuthService.signInWithGoogle();
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      // Google OAuth redirects, so we don't get user immediately
      setAuthState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, redirecting: true };
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));
      return { success: false, error: authError };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await AuthService.signOut();
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));
      return { success: false, error: authError };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!authState.user) return { success: false, error: { message: 'No user logged in' } };
    
    try {
      const { profile, error } = await AuthService.createOrUpdateProfile(authState.user.id, profileData);
      
      if (error) {
        setAuthState(prev => ({ ...prev, error }));
        return { success: false, error };
      }

      if (profile) {
        setAuthState(prev => ({ ...prev, profile, error: null }));
        return { success: true, profile };
      }
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      setAuthState(prev => ({ ...prev, error: authError }));
      return { success: false, error: authError };
    }
  }, [authState.user]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await AuthService.resetPassword(email);
      return { success: !error, error };
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      return { success: false, error: authError };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await AuthService.updatePassword(newPassword);
      return { success: !error, error };
    } catch (error) {
      const authError: AuthError = { message: 'An unexpected error occurred' };
      return { success: false, error: authError };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setAuthState(prev => ({ ...prev, user: session.user, loading: false }));
          await loadUserProfile(session.user.id);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState(prev => ({ ...prev, user: session.user, loading: false, error: null }));
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
      } else if (event === 'USER_UPDATED' && session?.user) {
        setAuthState(prev => ({ ...prev, user: session.user }));
        await loadUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword
  };
}; 