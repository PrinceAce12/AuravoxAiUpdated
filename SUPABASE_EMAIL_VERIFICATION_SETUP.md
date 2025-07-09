# Supabase Email Verification Setup Guide

## Issue: Email verification not working for signup

This guide will help you fix the email verification issue in your Supabase project.

## Step 1: Check Supabase Dashboard Configuration

### 1.1 Enable Email Confirmation

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `iwtdbchibdhnhpstrrod`
3. Navigate to **Authentication** > **Providers**
4. Click on **Email** provider
5. **IMPORTANT**: Make sure these settings are enabled:
   - ✅ **Enable email confirmations** - This is CRITICAL
   - ✅ **Enable secure email change**
   - Set **Minimum password length** to 6 or higher
   - Configure **Password strength** as needed

### 1.2 Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Click on **Confirm signup** template
3. Customize the template with your app branding
4. Make sure the verification link is included
5. Test the template by sending a test email

### 1.3 Check Site URL Configuration

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/`
   - `http://localhost:5173/chat`

## Step 2: Verify Database Setup

Run this SQL in your Supabase SQL Editor to ensure the database is properly configured:

```sql
-- Check if profiles table exists
SELECT 
    'Profiles table:' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'profiles' AND table_schema = 'public'
        ) THEN 'Exists'
        ELSE 'Missing'
    END as status;

-- Check if triggers are working
SELECT 
    'Auth user trigger:' as trigger_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) THEN 'Exists'
        ELSE 'Missing'
    END as status;

-- Check if RLS is enabled on profiles table
SELECT 
    'RLS on profiles:' as setting,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'profiles' 
            AND schemaname = 'public' 
            AND rowsecurity = true
        ) THEN 'Enabled'
        ELSE 'Disabled'
    END as status;

-- Check if users exist in auth.users
SELECT 
    'Auth users count:' as info,
    COUNT(*) as user_count
FROM auth.users;

-- Check if profiles are being created automatically
SELECT 
    'Profiles count:' as info,
    COUNT(*) as profile_count
FROM public.profiles;

-- Check if all users have profiles (should match)
SELECT 
    'Users without profiles:' as info,
    COUNT(*) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

## Step 3: Test Email Verification

### 3.1 Test Signup Flow

1. Open your app in the browser
2. Click "Sign up"
3. Enter a valid email address
4. Enter a password (minimum 6 characters)
5. Submit the form
6. Check if you see the "Verify your email" screen
7. Check your email for the verification link

### 3.2 Debug Common Issues

If email verification is still not working:

1. **Check Supabase Logs**:
   - Go to **Logs** > **Auth** in Supabase Dashboard
   - Look for any errors during signup

2. **Check Email Delivery**:
   - Go to **Authentication** > **Users** in Supabase Dashboard
   - Check if users are being created
   - Look for email delivery status

3. **Test with Different Email**:
   - Try using a different email provider (Gmail, Outlook, etc.)
   - Check spam folder

## Step 4: Environment Variables

Make sure your environment variables are correct:

```env
VITE_SUPABASE_URL=https://iwtdbchibdhnhpstrrod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dGRiY2hpYmRobmhwc3Rycm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjMxODIsImV4cCI6MjA2NTczOTE4Mn0.sUktFxB2et9yid7MoWudHks8u4cSLevozHmBYPD64cg
```

## Step 5: Code Verification

The code has been updated to use the proper AuthService. Here's what was changed:

### 5.1 Chat Component Updates

The `handleAuth` function in `src/pages/Chat.tsx` now uses `AuthService.signUpWithEmail()` instead of direct Supabase calls:

```typescript
const handleAuth = async () => {
  setAuthError(null);
  if (authMode === 'sign-in') {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    else setShowAuthModal(false);
  } else {
    // Use AuthService for proper email verification handling
    const { user, error, requiresVerification } = await AuthService.signUpWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
    } else if (requiresVerification) {
      // Show email verification screen
      setShowVerifyEmail(true);
    } else if (user) {
      // User is immediately available (rare case)
      setShowAuthModal(false);
    }
  }
};
```

### 5.2 AuthService Implementation

The `AuthService.signUpWithEmail()` method properly handles email verification:

```typescript
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
```

## Step 6: Troubleshooting Checklist

If email verification is still not working, check these items:

- [ ] Email confirmations are enabled in Supabase Dashboard
- [ ] Site URL is configured correctly
- [ ] Redirect URLs are set properly
- [ ] Email templates are configured
- [ ] Database triggers are working
- [ ] No errors in Supabase logs
- [ ] Email is not in spam folder
- [ ] Environment variables are correct
- [ ] Code is using AuthService instead of direct Supabase calls

## Step 7: Alternative Solutions

If the issue persists:

1. **Check Supabase Status**: Visit https://status.supabase.com
2. **Contact Supabase Support**: If it's a platform issue
3. **Use Different Email Provider**: Try Gmail, Outlook, etc.
4. **Test in Incognito Mode**: To rule out browser cache issues
5. **Check Network Tab**: Look for failed requests in browser dev tools

## Step 8: Production Considerations

For production deployment:

1. Update Site URL to your production domain
2. Add production redirect URLs
3. Configure custom email templates with your branding
4. Set up proper CORS settings
5. Monitor email delivery rates
6. Set up email analytics

This should resolve the email verification issue. The main problem was likely that the Chat component was using direct Supabase calls instead of the proper AuthService that handles email verification correctly. 