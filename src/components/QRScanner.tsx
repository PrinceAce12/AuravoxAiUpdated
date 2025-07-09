import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Shield, Check, Camera, CameraOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';

interface QRScannerProps {
  forceShow?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ forceShow = false }) => {
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // The expected QR code content
  const ADMIN_QR_CODE = 'aura-token-secret-placeholder=(PrinceAce06...Kervee)';

  useEffect(() => {
    return () => {
      // Cleanup camera on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Scan for QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // QR code found!
      setQrInput(code.data);
      setScanStatus('QR Code detected!');
      stopCamera();
      setIsScanning(true);
      
      // Auto-verify if it matches the expected code
      setTimeout(() => {
        if (code.data === ADMIN_QR_CODE) {
          sessionStorage.setItem('admin_access', 'true');
          sessionStorage.setItem('admin_access_time', Date.now().toString());
          navigate('/admin/dashboard');
        } else {
          alert('Invalid QR code. Access denied.');
        }
        setIsScanning(false);
        setScanStatus('');
      }, 1000);
    } else {
      setScanStatus('Scanning for QR code...');
      // Continue scanning
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      setScanStatus('');
      setIsCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          // Start scanning after video starts playing
          setTimeout(() => {
            scanQRCode();
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Failed to access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError('');
    setScanStatus('');
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

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
          {/* Camera Toggle Button */}
          <div className="mb-4">
            <Button
              type="button"
              onClick={toggleCamera}
              variant="outline"
              className={`w-full ${
                isCameraActive 
                  ? 'border-red-200 text-red-700 hover:bg-red-50' 
                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              {isCameraActive ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Turn Off Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Turn On Camera
                </>
              )}
            </Button>
          </div>

          {/* Camera Video */}
          {isCameraActive && (
            <div className="mb-4">
              <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-400 rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                  </div>
                </div>
              </div>
              {cameraError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {cameraError}
                </p>
              )}
              {scanStatus && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                  {scanStatus}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleQRSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                QR Code Content
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Enter QR code content or scan with camera"
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  required
                />
                {qrInput && (
                  <button
                    type="button"
                    onClick={() => setQrInput('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <QrCode className="w-4 h-4 inline mr-1" />
              Use the provided QR code to gain admin access. You can either scan it with your camera or enter the code manually.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
