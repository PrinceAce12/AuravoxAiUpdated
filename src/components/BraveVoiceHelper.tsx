import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Shield,
  Settings,
  Globe,
  HelpCircle
} from 'lucide-react';

interface BraveVoiceHelperProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  error: string | null;
  method: 'webSpeech' | 'mediaRecorder' | 'manual' | null;
  onShowManualInput: () => void;
  transcript?: string;
}

export const BraveVoiceHelper: React.FC<BraveVoiceHelperProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  error,
  method,
  onShowManualInput,
  transcript
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const isBrave = navigator.userAgent.includes('Brave');

  if (!isBrave) {
    return null;
  }

  const getBraveStatus = () => {
    if (error && error.includes('Brave')) {
      return {
        status: 'blocked',
        message: 'Brave Shields are blocking voice recognition',
        color: 'text-red-500',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
    
    if (method === 'webSpeech') {
      return {
        status: 'working',
        message: 'Voice recognition is working',
        color: 'text-green-500',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
    
    if (method === 'mediaRecorder') {
      return {
        status: 'fallback',
        message: 'Using MediaRecorder fallback',
        color: 'text-yellow-500',
        icon: <Info className="w-4 h-4" />
      };
    }
    
    return {
      status: 'manual',
      message: 'Using manual input',
      color: 'text-blue-500',
      icon: <HelpCircle className="w-4 h-4" />
    };
  };

  const braveStatus = getBraveStatus();

  return (
    <>
      {/* Brave Status Indicator */}
      <div className="fixed bottom-20 right-4 z-50">
        <Card className="w-80 shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {braveStatus.icon}
                <span className={`text-sm font-medium ${braveStatus.color}`}>
                  {braveStatus.message}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Brave
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Current Method */}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Method:</span> {method || 'manual'}
              </div>

              {/* Live Transcript */}
              {transcript && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Transcript:</span> {transcript}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={isListening ? onStopListening : onStartListening}
                  className={`flex items-center gap-2 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      Try Voice
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHelp(true)}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="w-3 h-3" />
                  Help
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowManualInput}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-3 h-3" />
                  Manual
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brave Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Brave Browser Voice Recognition Help
            </DialogTitle>
            <DialogDescription>
              Brave browser has enhanced privacy features that may block voice recognition
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Quick Fixes:</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">1.</span>
                  <span>Click the Brave Shields icon (🛡️) in the address bar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">2.</span>
                  <span>Click "Site settings" → "Microphone" → "Allow"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">3.</span>
                  <span>Refresh the page and try voice recognition again</span>
                </li>
              </ol>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Alternative Solutions:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-medium">•</span>
                  <span>Use Chrome or Edge for better voice recognition support</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-medium">•</span>
                  <span>Test in production environment (voice works better there)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-medium">•</span>
                  <span>Use manual text input as a reliable alternative</span>
                </div>
              </div>
            </div>

            <Separator />

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Brave's privacy features are designed to protect you, but they can sometimes block legitimate features like voice recognition. The manual input option is always available as a reliable alternative.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowHelp(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowHelp(false);
                  onShowManualInput();
                }}
                className="flex-1"
              >
                Use Manual Input
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 