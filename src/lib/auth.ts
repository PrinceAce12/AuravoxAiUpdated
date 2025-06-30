import { supabase } from '@/integrations/supabase/client';

export interface AuthError {
  message: string;
  code?: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
  };
  avatar_url?: string;
  email_confirmed_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  // Sign up with email and password
  static async signUpWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null; requiresVerification?: boolean }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0], // Default name from email
          }
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        // Email verification required
        return { user: null, error: null, requiresVerification: true };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign up' } 
      };
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign in' } 
      };
    }
  }

  // Sign in with Google OAuth
  static async signInWithGoogle(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      // OAuth doesn't return user immediately, it redirects
      return { user: null, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during Google sign in' } 
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.status?.toString() } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during sign out' } };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred while getting user' } 
      };
    }
  }

  // Create or update user profile
  static async createOrUpdateProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
    try {
      // First, try to get existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          return { profile: null, error: { message: error.message, code: error.code } };
        }

        return { profile: data, error: null };
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: profileData.email || '',
            full_name: profileData.full_name || '',
            avatar_url: profileData.avatar_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          return { profile: null, error: { message: error.message, code: error.code } };
        }

        return { profile: data, error: null };
      }
    } catch (error) {
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while managing profile' } 
      };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error: { message: error.message, code: error.code } };
      }

      return { profile: data, error: null };
    } catch (error) {
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while getting profile' } 
      };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { error: { message: error.message, code: error.status?.toString() } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: { message: error.message, code: error.status?.toString() } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during password update' } };
    }
  }
} 