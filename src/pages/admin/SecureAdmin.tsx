import React from 'react';
import QRScanner from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecureAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_access');
    sessionStorage.removeItem('admin_access_time');
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="glass-card border-0 w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Secure Admin Access
          </CardTitle>
          <CardDescription>
            Scan QR code to access admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Scanner */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                QR Code Authentication
              </span>
            </div>
            
            <QRScanner forceShow />
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Shield className="w-4 h-4 inline mr-1" />
              Scan the QR code to access the admin dashboard securely.
            </p>
          </div>

          {/* Logout Button */}
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAdmin;
