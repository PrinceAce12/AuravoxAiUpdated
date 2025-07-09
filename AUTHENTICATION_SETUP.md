# Authentication Setup Guide

This guide will help you set up both email/password and Google OAuth authentication in your Supabase project with email verification and password confirmation.

## Prerequisites

1. A Supabase project
2. Supabase CLI installed (optional, for local development)

## Step 1: Database Setup

### Run the Migration

First, apply the database migration to create the proper profiles table structure:

```sql
-- Run this in your Supabase SQL editor or via migration
-- File: supabase/migrations/001_create_profiles_table.sql

-- Create profiles table with proper structure for both email/password and OAuth users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile when user data changes
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update profile when user data changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
```

## Step 2: Supabase Authentication Configuration

### 1. Enable Email/Password Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Email** provider
4. Configure email settings:
   - **Enable email confirmations**: ✅ **REQUIRED** - This enables email verification
   - **Enable secure email change**: Recommended
   - **Enable double confirm changes**: Optional
   - **Minimum password length**: Set to 6 or higher
   - **Password strength**: Configure as needed

### 2. Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customize the email templates for:
   - **Confirm signup**: This is the email users receive for verification
   - **Reset password**: For password reset functionality
   - **Change email address**: For email change confirmations

#### Email Template Configuration:

**Confirm signup template should include:**
- Clear verification instructions
- Your app branding
- Link to your app after verification

### 3. Configure Google OAuth

1. In **Authentication** > **Providers**, enable **Google**
2. You'll need to create a Google OAuth application:

#### Creating Google OAuth App:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen
6. Set application type to **Web application**
7. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
8. Copy the **Client ID** and **Client Secret**

#### Back to Supabase:

1. Paste your Google **Client ID** and **Client Secret**
2. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Environment Variables

Make sure your environment variables are properly configured:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Application Configuration

The application is already configured to use both authentication methods with email verification. Here's what's implemented:

### Authentication Service (`src/lib/auth.ts`)

- `signUpWithEmail()` - Email/password registration with verification
- `signInWithEmail()` - Email/password login
- `signInWithGoogle()` - Google OAuth login
- `signOut()` - Logout
- `createOrUpdateProfile()` - Profile management
- `getUserProfile()` - Get user profile
- `resetPassword()` - Password reset
- `updatePassword()` - Password update

### Authentication Hook (`src/hooks/useAuth.ts`)

- Manages authentication state
- Handles both email/password and OAuth flows
- Automatic profile creation/update
- Email verification flow handling
- Error handling and loading states

### Chat Component (`src/pages/Chat.tsx`)

- Uses the `useAuth` hook for authentication
- Supports both sign-in and sign-up modes
- **Confirm password field** for sign-up validation
- **Email verification flow** with proper UI
- Google OAuth integration

### Auth Callback Page (`src/pages/AuthCallback.tsx`)

- Handles email verification redirects
- Shows verification status
- Redirects to chat after successful verification

## Step 5: Testing the Setup

### Test Email/Password Authentication with Verification:

1. Click "Sign up" in the app
2. Enter email and password
3. **Enter confirm password** (must match)
4. Submit the form
5. Check email for verification link
6. Click verification link
7. Should redirect to `/auth/callback` and then to chat
8. Sign in with credentials

### Test Password Validation:

- ✅ Passwords must match
- ✅ Password must be at least 6 characters
- ✅ Confirm password field only shows during sign-up
- ✅ Form clears when switching between sign-in/sign-up

### Test Google OAuth:

1. Click "Continue with Google"
2. Complete Google OAuth flow
3. User should be automatically signed in

### Verify Profile Creation:

1. After successful authentication, check the `profiles` table
2. Verify that a profile was automatically created
3. Check that the profile contains the correct user information

## Step 6: Email Verification Flow

### How it works:

1. **User signs up** with email/password + confirm password
2. **Validation occurs**:
   - Passwords match
   - Password meets minimum length
   - Email is valid
3. **Supabase creates user** (unconfirmed)
4. **Verification email sent** automatically
5. **User clicks link** in email
6. **Redirects to** `/auth/callback`
7. **Email confirmed** and user can sign in
8. **Profile created** automatically

### Email Verification States:

- **Unconfirmed**: User exists but email not verified
- **Confirmed**: User can sign in normally
- **Error**: Verification failed, user can retry

## Troubleshooting

### Common Issues:

1. **Profile not created automatically**
   - Check if the database triggers are properly installed
   - Verify RLS policies are correct
   - Check Supabase logs for errors

2. **Email verification not working**
   - Check email provider settings in Supabase
   - Verify email templates are configured
   - Check spam folder
   - Ensure redirect URL is correct

3. **Google OAuth not working**
   - Verify redirect URIs are correct
   - Check Google Cloud Console settings
   - Ensure Google+ API is enabled

4. **Password validation errors**
   - Check password length requirements
   - Verify confirm password field is working
   - Test password matching validation

5. **RLS Policy Errors**
   - Ensure policies are created correctly
   - Check that `auth.uid()` function is available
   - Verify user authentication state

### Debugging:

1. Check browser console for errors
2. Monitor Supabase logs in dashboard
3. Use Supabase CLI for local debugging
4. Test authentication flows step by step
5. Check email delivery in Supabase dashboard

## Security Considerations

1. **Email Verification**: Always enable email verification for production
2. **Password Requirements**: Configure strong password requirements
3. **Rate Limiting**: Implement rate limiting for auth endpoints
4. **Session Management**: Configure appropriate session timeouts
5. **CORS**: Ensure proper CORS configuration for your domains
6. **Password Confirmation**: Prevents typos during sign-up

## Production Deployment

1. Update redirect URIs for production domain
2. Configure custom email templates
3. Set up proper error monitoring
4. Test all authentication flows
5. Monitor authentication logs
6. Test email delivery in production

## Additional Features

The authentication system supports:

- ✅ Email/password registration and login
- ✅ **Confirm password validation**
- ✅ **Email verification flow**
- ✅ Google OAuth integration
- ✅ Automatic profile creation
- ✅ Password reset functionality
- ✅ Profile management
- ✅ Session management
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Auth callback page
- ✅ Password strength validation

This setup provides a complete authentication solution that works seamlessly with both email/password and Google OAuth methods, with automatic profile management, email verification, and proper security measures including password confirmation. 