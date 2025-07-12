import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleVoiceRecognition } from '@/hooks/useSimpleVoiceRecognition';
import { Mic, MicOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const VoiceTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    transcript,
    error
  } = useSimpleVoiceRecognition({
    onResult: (finalTranscript) => {
      setDebugInfo(prev => prev + `\n✅ Final result: ${finalTranscript}`);
      // Only show toast for actual results, not development errors
      if (finalTranscript.trim()) {
        toast.success(`Voice input: ${finalTranscript}`);
      }
    },
    onError: (errorMessage) => {
      setDebugInfo(prev => prev + `\n❌ Error: ${errorMessage}`);
      // Only show error toast for non-development errors
      if (!errorMessage.includes('development environment')) {
        toast.error(errorMessage);
      }
    },
    onStart: () => {
      setDebugInfo(prev => prev + '\n🎤 Started listening...');
      // Silent start - no notification
    },
    onEnd: () => {
      setDebugInfo(prev => prev + '\n⏹️ Stopped listening');
      // Silent end - no notification
    }
  });

  const checkBrowserSupport = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isHTTPS = window.location.protocol === 'https:';
    const hasMicrophone = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    
    const info = `
🌐 Browser Support Check:
- SpeechRecognition: ${!!SpeechRecognition ? '✅ Available' : '❌ Not Available'}
- HTTPS: ${isHTTPS ? '✅ Yes' : '❌ No'}
- Microphone: ${hasMicrophone ? '✅ Available' : '❌ Not Available'}
- User Agent: ${navigator.userAgent}
- Protocol: ${window.location.protocol}
- Host: ${window.location.host}
    `;
    
    setDebugInfo(prev => prev + info);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSupported ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Voice Recognition Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-2 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Listening
                </>
              )}
            </Button>
            
            <Button
              onClick={checkBrowserSupport}
              variant="outline"
            >
              Check Browser Support
            </Button>
            
            <Button
              onClick={reset}
              variant="outline"
            >
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <strong>Status:</strong> {isSupported ? '✅ Supported' : '❌ Not Supported'}
            </div>
            <div className="text-sm">
              <strong>Listening:</strong> {isListening ? '🎤 Yes' : '⏸️ No'}
            </div>
            <div className="text-sm">
              <strong>Transcript:</strong> {transcript || 'None'}
            </div>
            {error && (
              <div className="text-sm text-red-500">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Debug Information:</h4>
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-64">
              {debugInfo || 'No debug info yet. Click "Check Browser Support" to start.'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 