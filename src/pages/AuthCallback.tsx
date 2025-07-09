import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('Error verifying your email. Please try again.');
          return;
        }

        if (data.session?.user) {
          // Check if email is confirmed
          if (data.session.user.email_confirmed_at) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to chat...');
            
            // Redirect to chat after a short delay
            setTimeout(() => {
              navigate('/chat');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Email verification failed. Please check your email and try again.');
          }
        } else {
          setStatus('error');
          setMessage('No session found. Please try signing up again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleRetry = () => {
    navigate('/chat');
  };

  const handleSignUp = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-950 rounded-xl shadow-2xl border-0 p-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo/Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="16" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                <rect x="7.5" y="2" width="7" height="4" rx="2" fill="white" fillOpacity="0.7"/>
                <circle cx="7.5" cy="11" r="1.2" fill="#6366F1"/>
                <circle cx="14.5" cy="11" r="1.2" fill="#6366F1"/>
                <rect x="9.5" y="15" width="3" height="1.2" rx="0.6" fill="#6366F1"/>
                <rect x="2" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="18" y="9" width="2" height="4" rx="1" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
          </div>

          {/* Status Icon */}
          <div className="mb-4">
            {status === 'loading' && (
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          {status === 'error' && (
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleSignUp} variant="outline" className="w-full">
                Back to Sign Up
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting automatically...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 