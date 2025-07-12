import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSimpleVoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
}

interface UseSimpleVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  transcript: string;
  error: string | null;
}

export const useSimpleVoiceRecognition = ({
  onResult,
  onError,
  onStart,
  onEnd,
  lang = 'en-US'
}: UseSimpleVoiceRecognitionProps): UseSimpleVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const hasFailedRef = useRef(false);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);

    if (supported) {
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setIsStarting(false);
          setError(null);
          hasFailedRef.current = false;
          onStart?.();
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          finalTranscriptRef.current = finalTranscript;
          const currentTranscript = finalTranscript + interimTranscript;
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          // Prevent multiple error calls
          if (hasFailedRef.current) {
            return;
          }
          
          hasFailedRef.current = true;
          setIsListening(false);
          setIsStarting(false);
          
          // Enhanced error handling for development
          let errorMessage = getErrorMessage(event.error);
          
          // Special handling for Brave browser and development
          const isBrave = navigator.userAgent.includes('Brave');
          const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          if (event.error === 'network' && (isBrave || isDevelopment)) {
            errorMessage = 'Network error in development environment. This is normal for localhost. Try: 1) Using Chrome/Edge, 2) Testing in production, or 3) Using manual input.';
          }
          
          setError(errorMessage);
          onError?.(errorMessage);
        };

        recognition.onend = () => {
          setIsListening(false);
          setIsStarting(false);
          if (finalTranscriptRef.current.trim()) {
            onResult(finalTranscriptRef.current.trim());
          }
          onEnd?.();
        };
      } catch (err) {
        setIsSupported(false);
      }
    }
  }, [lang, onResult, onError, onStart, onEnd]);

  const startListening = useCallback(() => {
    // Prevent multiple rapid calls
    if (isStarting || isListening) {
      return;
    }

    if (!isSupported) {
      const errorMessage = 'Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setIsStarting(true);
      setTranscript('');
      finalTranscriptRef.current = '';
      hasFailedRef.current = false;
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      setIsStarting(false);
      const errorMessage = 'Failed to start voice recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isSupported, isListening, isStarting, onError]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      // Silent error handling
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    hasFailedRef.current = false;
    setIsStarting(false);
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort();
    }
  }, [isListening]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error occurred. This might be due to development environment or network issues. Try refreshing the page.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case 'language-not-supported':
        return 'Language not supported for speech recognition.';
      default:
        return `Speech recognition error: ${error}`;
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    transcript,
    error
  };
}; 