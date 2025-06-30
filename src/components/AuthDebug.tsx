import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const AuthDebug = () => {
  const { user, profile, loading, error, signOut } = useAuth();

  const handleTestSignOut = async () => {
    console.log('Test sign out clicked');
    try {
      const result = await signOut();
      console.log('Test sign out result:', result);
    } catch (error) {
      console.error('Test sign out error:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 max-w-xs">
      <h3 className="font-semibold mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1 mb-3">
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Profile: {profile ? '✅' : '❌'}</div>
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>Error: {error ? '❌' : '✅'}</div>
        <div>SignOut Function: {typeof signOut}</div>
      </div>
      <Button 
        onClick={handleTestSignOut} 
        size="sm" 
        variant="outline"
        className="w-full"
      >
        Test Sign Out
      </Button>
    </div>
  );
};

export default AuthDebug; 