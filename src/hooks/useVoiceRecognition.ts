import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  transcript: string;
  error: string | null;
}

export const useVoiceRecognition = ({
  onResult,
  onError,
  onStart,
  onEnd,
  continuous = false,
  interimResults = true,
  lang = 'en-US'
}: UseVoiceRecognitionProps): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        onStart?.();
      };

      recognition.onresult = (event) => {
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

      recognition.onerror = (event) => {
        setIsListening(false);
        const errorMessage = getErrorMessage(event.error);
        setError(errorMessage);
        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscriptRef.current.trim()) {
          onResult(finalTranscriptRef.current.trim());
        }
        onEnd?.();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        finalTranscriptRef.current = '';
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start voice recognition');
        onError?.('Failed to start voice recognition');
      }
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
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
        return 'Network error occurred. Please check your connection.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
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