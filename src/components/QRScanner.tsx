import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Shield, Check, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QRScannerProps {
  forceShow?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ forceShow = false }) => {
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  // The expected QR code content (you can modify this based on what your QR code contains)
  const ADMIN_QR_CODE = 'aura-token-secret-placeholder=(PrinceAce06...Kervee)';

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setTimeout(() => {
      if (qrInput === ADMIN_QR_CODE) {
        sessionStorage.setItem('admin_access', 'true');
        sessionStorage.setItem('admin_access_time', Date.now().toString());
        navigate('/admin/dashboard');
      } else {
        alert('Invalid QR code. Access denied.');
      }
      setIsScanning(false);
    }, 1000);
  };

  const handleTestAccess = () => {
    sessionStorage.setItem('admin_access', 'true');
    sessionStorage.setItem('admin_access_time', Date.now().toString());
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="glass-card border-0 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Admin Access
          </CardTitle>
          <CardDescription>
            Scan or enter the QR code to access admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQRSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                QR Code Content
              </label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Enter QR code content"
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isScanning ? (
                <>
                  <QrCode className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Verify Access
                </>
              )}
            </Button>
          </form>
          
          {/* Test Access Button for Development */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleTestAccess}
              variant="outline"
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
            >
              <Key className="w-4 h-4 mr-2" />
              Test Admin Access (Development)
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <QrCode className="w-4 h-4 inline mr-1" />
              Use the provided QR code to gain admin access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
