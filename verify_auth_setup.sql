-- Verification Script: Check Authentication Setup
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check if profiles table exists and has correct structure
SELECT 
    'Profiles table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if auth.users table has users (passwords are hashed and secure)
SELECT 
    'Auth users count:' as info,
    COUNT(*) as user_count
FROM auth.users;

-- 3. Check if profiles are being created automatically
SELECT 
    'Profiles count:' as info,
    COUNT(*) as profile_count
FROM public.profiles;

-- 4. Check if all users have profiles (should match)
SELECT 
    'Users without profiles:' as info,
    COUNT(*) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Show sample user data (without sensitive info)
SELECT 
    'Sample user data:' as info,
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at as auth_created,
    p.full_name,
    p.avatar_url,
    p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LIMIT 5;

-- 6. Check if triggers are working
SELECT 
    'Triggers:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth_user%';

-- 7. Check RLS policies
SELECT 
    'RLS Policies:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Verify the setup is working correctly
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users) 
        AND EXISTS (SELECT 1 FROM public.profiles)
        AND NOT EXISTS (
            SELECT 1 FROM auth.users au
            LEFT JOIN public.profiles p ON au.id = p.id
            WHERE p.id IS NULL
        )
        THEN '✅ Authentication setup is working correctly!'
        ELSE '❌ There are issues with the authentication setup'
    END as verification_result; 