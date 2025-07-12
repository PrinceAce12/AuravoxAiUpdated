import { useState, useCallback, useEffect, useRef } from 'react';

interface UseBraveVoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
}

interface UseBraveVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  transcript: string;
  error: string | null;
  method: 'webSpeech' | 'mediaRecorder' | 'manual' | null;
}

export const useBraveVoiceRecognition = ({
  onResult,
  onError,
  onStart,
  onEnd,
  lang = 'en-US'
}: UseBraveVoiceRecognitionProps): UseBraveVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [method, setMethod] = useState<'webSpeech' | 'mediaRecorder' | 'manual' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef('');
  const isBraveRef = useRef(false);

  // Detect Brave browser
  useEffect(() => {
    isBraveRef.current = navigator.userAgent.includes('Brave');
  }, []);

  // Initialize voice recognition with multiple fallback strategies
  useEffect(() => {
    const initializeVoiceRecognition = () => {
      // Method 1: Try Web Speech API with Brave-specific settings
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          const recognition = recognitionRef.current;

          // Brave-specific settings
          recognition.continuous = false;
          recognition.interimResults = false; // Brave works better without interim results
          recognition.lang = lang;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setMethod('webSpeech');
            onStart?.();
          };

          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            finalTranscriptRef.current = finalTranscript;
            setTranscript(finalTranscript);
          };

          recognition.onerror = (event: any) => {
            console.log('Web Speech API error:', event.error);
            // For Brave, try MediaRecorder fallback
            if (isBraveRef.current && (event.error === 'network' || event.error === 'not-allowed')) {
              console.log('Brave detected, switching to MediaRecorder fallback');
              setMethod('mediaRecorder');
              setIsSupported(true);
            } else {
              handleError(event.error);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            if (finalTranscriptRef.current.trim()) {
              onResult(finalTranscriptRef.current.trim());
            }
            onEnd?.();
          };

          setIsSupported(true);
          setMethod('webSpeech');
          return;
        } catch (err) {
          console.warn('Web Speech API failed, trying MediaRecorder...');
        }
      }

      // Method 2: MediaRecorder fallback for Brave
      if (isBraveRef.current) {
        console.log('Brave browser detected, using MediaRecorder fallback');
        setMethod('mediaRecorder');
        setIsSupported(true);
      } else {
        // Method 3: Manual input fallback
        setMethod('manual');
        setIsSupported(true);
      }
    };

    initializeVoiceRecognition();
  }, [lang, onResult, onError, onStart, onEnd]);

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await sendForTranscription(audioBlob);
        } catch (err) {
          console.error('Error processing audio:', err);
          handleError('audio-processing-failed');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsListening(true);
      setError(null);
      onStart?.();
    } catch (err) {
      console.error('MediaRecorder failed:', err);
      handleError('media-recorder-failed');
    }
  };

  const sendForTranscription = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Use Vercel function URL in production, localhost in development
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5001';
      
      const response = await fetch(`${baseUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.transcript) {
        const transcript = data.transcript;
        setTranscript(transcript);
        onResult(transcript);
      } else {
        throw new Error('No transcript received');
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      handleError('transcription-failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMessage = 'Voice recognition is not supported in this browser.';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setTranscript('');
      finalTranscriptRef.current = '';
      
      if (method === 'webSpeech' && recognitionRef.current) {
        recognitionRef.current.start();
      } else if (method === 'mediaRecorder') {
        startMediaRecorder();
      } else if (method === 'manual') {
        // For manual input, just show the fallback modal
        setIsListening(true);
        onStart?.();
      }
    } catch (error) {
      const errorMessage = 'Failed to start voice recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isSupported, method, onError, onStart]);

  const stopListening = useCallback(() => {
    try {
      if (method === 'webSpeech' && recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      } else if (method === 'mediaRecorder' && mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsListening(false);
        onEnd?.();
      } else if (method === 'manual') {
        setIsListening(false);
        onEnd?.();
      }
    } catch (error) {
      console.warn('Error stopping voice recognition:', error);
    }
  }, [isListening, isRecording, method, onEnd]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    setIsRecording(false);
    setIsTranscribing(false);
    
    if (method === 'webSpeech' && recognitionRef.current && isListening) {
      recognitionRef.current.abort();
    } else if (method === 'mediaRecorder' && mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isListening, isRecording, method]);

  const handleError = (error: string) => {
    setIsListening(false);
    setIsRecording(false);
    setIsTranscribing(false);
    
    let errorMessage = getErrorMessage(error);
    
    if (isBraveRef.current) {
      errorMessage = 'Brave browser detected. Using MediaRecorder fallback for voice recognition.';
    }
    
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error occurred. This might be due to Brave privacy settings.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      case 'audio-processing-failed':
        return 'Failed to process audio. Please try again.';
      case 'media-recorder-failed':
        return 'MediaRecorder failed. Please check microphone permissions.';
      case 'transcription-failed':
        return 'Transcription failed. Please try again.';
      default:
        return `Voice recognition error: ${error}`;
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    transcript,
    error,
    method
  };
}; 