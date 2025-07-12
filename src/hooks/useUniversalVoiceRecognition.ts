import { useState, useCallback, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'speech-recognition-polyfill';

interface UseUniversalVoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface UseUniversalVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  transcript: string;
  error: string | null;
  browserSupport: {
    webSpeechAPI: boolean;
    reactSpeechRecognition: boolean;
    polyfill: boolean;
  };
}

export const useUniversalVoiceRecognition = ({
  onResult,
  onError,
  onStart,
  onEnd,
  continuous = false,
  interimResults = true,
  lang = 'en-US'
}: UseUniversalVoiceRecognitionProps): UseUniversalVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [browserSupport, setBrowserSupport] = useState({
    webSpeechAPI: false,
    reactSpeechRecognition: false,
    polyfill: false
  });
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const currentMethodRef = useRef<'webSpeech' | 'reactSpeech' | 'polyfill' | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const checkBrowserSupport = () => {
      const webSpeechAPI = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
      const reactSpeechRecognition = !!SpeechRecognition;
      const polyfill = !!(window as any).SpeechRecognitionPolyfill;

      setBrowserSupport({
        webSpeechAPI,
        reactSpeechRecognition,
        polyfill
      });

      return { webSpeechAPI, reactSpeechRecognition, polyfill };
    };

    const support = checkBrowserSupport();
    
    // Initialize the best available method
    if (support.webSpeechAPI) {
      initializeWebSpeechAPI();
    } else if (support.reactSpeechRecognition) {
      initializeReactSpeechRecognition();
    } else if (support.polyfill) {
      initializePolyfill();
    }
  }, []);

  const initializeWebSpeechAPI = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          currentMethodRef.current = 'webSpeech';
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
    } catch (err) {
      console.warn('Web Speech API initialization failed:', err);
    }
  };

  const initializeReactSpeechRecognition = () => {
    try {
      // React Speech Recognition is already initialized
      currentMethodRef.current = 'reactSpeech';
    } catch (err) {
      console.warn('React Speech Recognition initialization failed:', err);
    }
  };

  const initializePolyfill = () => {
    try {
      const SpeechRecognitionPolyfill = (window as any).SpeechRecognitionPolyfill;
      if (SpeechRecognitionPolyfill) {
        recognitionRef.current = new SpeechRecognitionPolyfill();
        const recognition = recognitionRef.current;

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          currentMethodRef.current = 'polyfill';
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
    } catch (err) {
      console.warn('Polyfill initialization failed:', err);
    }
  };

  const startListening = useCallback(() => {
    const isSupported = browserSupport.webSpeechAPI || browserSupport.reactSpeechRecognition || browserSupport.polyfill;
    
    if (!isSupported) {
      const errorMessage = 'Voice recognition is not supported in this browser. Please try a modern browser like Chrome, Firefox, Safari, or Edge.';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setTranscript('');
      finalTranscriptRef.current = '';

      if (currentMethodRef.current === 'webSpeech' || currentMethodRef.current === 'polyfill') {
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start();
        }
      } else if (currentMethodRef.current === 'reactSpeech') {
        SpeechRecognition.startListening({ 
          continuous, 
          interimResults, 
          language: lang 
        });
      }
    } catch (error) {
      const errorMessage = 'Failed to start voice recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [browserSupport, isListening, continuous, interimResults, lang, onError]);

  const stopListening = useCallback(() => {
    try {
      if (currentMethodRef.current === 'webSpeech' || currentMethodRef.current === 'polyfill') {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      } else if (currentMethodRef.current === 'reactSpeech') {
        SpeechRecognition.stopListening();
      }
    } catch (error) {
      console.warn('Error stopping voice recognition:', error);
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    
    try {
      if (currentMethodRef.current === 'webSpeech' || currentMethodRef.current === 'polyfill') {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.abort();
        }
      } else if (currentMethodRef.current === 'reactSpeech') {
        SpeechRecognition.abortListening();
      }
    } catch (error) {
      console.warn('Error resetting voice recognition:', error);
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
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case 'language-not-supported':
        return 'Language not supported for speech recognition.';
      default:
        return `Speech recognition error: ${error}`;
    }
  };

  // React Speech Recognition hook for fallback
  const {
    transcript: reactTranscript,
    listening: reactListening,
    resetTranscript: resetReactTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    commands: [],
    continuous,
    interimResults,
    lang
  });

  // Sync React Speech Recognition state
  useEffect(() => {
    if (currentMethodRef.current === 'reactSpeech') {
      setIsListening(reactListening);
      setTranscript(reactTranscript);
    }
  }, [reactListening, reactTranscript]);

  const isSupported = browserSupport.webSpeechAPI || browserSupport.reactSpeechRecognition || browserSupport.polyfill || browserSupportsSpeechRecognition;

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    transcript,
    error,
    browserSupport
  };
}; 