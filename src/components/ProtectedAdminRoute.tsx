import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const location = useLocation();

  // The secret admin route
  const SECRET_ADMIN_ROUTE = '/1234567899765432134567867544/kervee/syp/lus/admin/';

  // Always allow access to the QRScanner on the secret route
  if (location.pathname === SECRET_ADMIN_ROUTE) {
    console.log('Accessing secret admin route, allowing access');
    return <>{children}</>;
  }

  const hasAdminAccess = () => {
    const access = sessionStorage.getItem('admin_access');
    const accessTime = sessionStorage.getItem('admin_access_time');
    
    console.log('Checking admin access:', { access, accessTime, pathname: location.pathname });
    
    if (!access || !accessTime) {
      console.log('No admin access found');
      return false;
    }
    
    // Check if access is still valid (24 hours)
    const accessTimestamp = parseInt(accessTime);
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (currentTime - accessTimestamp > twentyFourHours) {
      // Clear expired access
      console.log('Admin access expired, clearing');
      sessionStorage.removeItem('admin_access');
      sessionStorage.removeItem('admin_access_time');
      return false;
    }
    
    const hasAccess = access === 'true';
    console.log('Admin access result:', hasAccess);
    return hasAccess;
  };

  if (!hasAdminAccess()) {
    console.log('Redirecting to admin access page');
    return <Navigate to="/admin/access" replace />;
  }

  console.log('Admin access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedAdminRoute;
