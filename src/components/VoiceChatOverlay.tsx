import React from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceChatOverlayProps {
  isListening: boolean;
  onStop: () => void;
  transcript?: string;
}

export const VoiceChatOverlay: React.FC<VoiceChatOverlayProps> = ({
  isListening,
  onStop,
  transcript
}) => {
  if (!isListening) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Voice Chat
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Animated Microphone */}
        <div className="flex flex-col items-center space-y-6">
          {/* Pulsing microphone icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-6 shadow-lg voice-pulse">
              <Mic className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Listening...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Speak clearly into your microphone
            </p>
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Live transcript:
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {transcript}
              </p>
            </div>
          )}

          {/* Wave animation */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-gradient-to-t from-red-500 to-pink-500 rounded-full voice-wave"
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Stop button */}
          <Button
            onClick={onStop}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
          >
            <MicOff className="w-4 h-4" />
            Stop Recording
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click "Stop Recording" or press the microphone button again to stop
          </p>
        </div>
      </div>
    </div>
  );
}; 