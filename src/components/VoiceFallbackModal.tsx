import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send, AlertCircle, Info } from 'lucide-react';
import { getVoiceRecognitionStatus } from '@/lib/browserCompatibility';

interface VoiceFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  user?: any;
}

export const VoiceFallbackModal: React.FC<VoiceFallbackModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  user
}) => {
  const [message, setMessage] = useState('');
  const [browserStatus, setBrowserStatus] = useState(getVoiceRecognitionStatus());

  useEffect(() => {
    setBrowserStatus(getVoiceRecognitionStatus());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Voice Input Not Available
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              {browserStatus.message}
            </p>
            
            {/* Browser-specific information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Browser Information
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Browser:</strong> {browserStatus.browserInfo.name} {browserStatus.browserInfo.version}</p>
                <p><strong>HTTPS:</strong> {browserStatus.browserInfo.features.https ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Microphone:</strong> {browserStatus.browserInfo.features.microphone ? '✅ Available' : '❌ Not Available'}</p>
                <p><strong>Web Speech API:</strong> {browserStatus.browserInfo.features.webSpeechAPI ? '✅ Available' : '❌ Not Available'}</p>
              </div>
            </div>

            {/* Recommendations */}
            {browserStatus.recommendations.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Recommendations:
                </p>
                <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                  {browserStatus.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 