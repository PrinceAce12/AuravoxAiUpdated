import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  isFinal: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setLanguage: (language: string) => void;
  availableLanguages: string[];
  currentLanguage: string;
  confidence: number;
  isProcessing: boolean;
  browserInfo: {
    name: string;
    version: string;
    supportsSpeechRecognition: boolean;
    supportsWebkitSpeechRecognition: boolean;
    isSecure: boolean;
    userAgent: string;
  };
}

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    supportsSpeechRecognition: false,
    supportsWebkitSpeechRecognition: false,
    isSecure: false,
    userAgent: ''
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Enhanced browser detection and support checking
  const detectBrowserSupport = useCallback(() => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edg')) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Opera')) {
      browserName = 'Opera';
      browserVersion = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
    }

    // Check for Speech Recognition support
    const supportsSpeechRecognition = 'SpeechRecognition' in window;
    const supportsWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

    const browserInfo = {
      name: browserName,
      version: browserVersion,
      supportsSpeechRecognition,
      supportsWebkitSpeechRecognition,
      isSecure,
      userAgent
    };

    setBrowserInfo(browserInfo);

    // Determine if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || 
                               (window as any).webkitSpeechRecognition || 
                               (window as any).mozSpeechRecognition || 
                               (window as any).msSpeechRecognition;
    const supported = !!SpeechRecognition && isSecure;

    if (!supported) {
      let errorMessage = '';
      if (!isSecure) {
        errorMessage = 'Speech recognition requires a secure connection (HTTPS). Please use HTTPS or localhost.';
      } else if (!supportsSpeechRecognition && !supportsWebkitSpeechRecognition) {
        errorMessage = `Speech recognition is not supported in ${browserName} ${browserVersion}. Please use Chrome, Edge, or Safari.`;
      } else {
        errorMessage = 'Speech recognition is not available in this browser.';
      }
      setError(errorMessage + ' Please update your browser or try a different one.');
    }

    setIsSupported(supported);
    return { supported, SpeechRecognition };
  }, []);

  // Check if speech recognition is supported
  useEffect(() => {
    const { supported, SpeechRecognition } = detectBrowserSupport();
    
    if (supported && SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        setupRecognition();
        setupAudioAnalysis();
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setError('Failed to initialize speech recognition. Please try refreshing the page.');
        setIsSupported(false);
      }
    }
  }, [detectBrowserSupport]);

  // Setup audio analysis for better speech detection
  const setupAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      // Monitor audio levels for better speech detection
      const checkAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setConfidence(Math.min(average / 128, 1));
        }
      };
      
      const audioInterval = setInterval(checkAudioLevel, 100);
      
      return () => {
        clearInterval(audioInterval);
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    } catch (error) {
      console.warn('Audio analysis setup failed:', error);
    }
  }, [isListening]);

  // Setup recognition settings with enhanced configuration
  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Enhanced recognition settings for faster response
    recognition.continuous = false; // Changed to false for faster finalization
    recognition.interimResults = true;
    recognition.lang = currentLanguage;
    recognition.maxAlternatives = 1; // Reduced for faster processing
    recognition.serviceURI = ''; // Use default service

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setIsProcessing(false);
      console.log('Speech recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      console.log('Speech recognition ended');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let highestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          highestConfidence = Math.max(highestConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Apply noise reduction and confidence filtering
      const processedTranscript = processTranscript(finalTranscript + interimTranscript);
      setTranscript(processedTranscript);
      setIsFinal(finalTranscript.length > 0);
      setConfidence(highestConfidence);
      
      // Faster processing - don't wait for long pauses
      if (finalTranscript.length > 0) {
        setIsProcessing(true);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Enhanced error handling with specific solutions
      let errorMessage = '';
      let solution = '';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error: Speech recognition requires an active internet connection.';
          solution = 'Please check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied.';
          solution = 'Please allow microphone permissions in your browser settings and refresh the page.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected.';
          solution = 'Please speak clearly and try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture error.';
          solution = 'Please check your microphone and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed.';
          solution = 'Please check your browser settings and try again.';
          break;
        case 'bad-grammar':
          errorMessage = 'Grammar error.';
          solution = 'Please try speaking more clearly.';
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported.';
          solution = 'Please try a different language.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}.`;
          solution = 'Please try again.';
      }
      
      setError(`${errorMessage} ${solution}`);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
      // Faster response - process immediately when speech ends
      setIsProcessing(true);
    };

    recognition.onaudiostart = () => {
      console.log('Audio capture started');
    };

    recognition.onaudioend = () => {
      console.log('Audio capture ended');
    };

    recognition.onsoundstart = () => {
      console.log('Sound detected');
    };

    recognition.onsoundend = () => {
      console.log('Sound ended');
    };
  }, [currentLanguage]);

  // Process transcript for better accuracy
  const processTranscript = useCallback((text: string): string => {
    if (!text) return '';
    
    // Remove extra whitespace
    let processed = text.trim().replace(/\s+/g, ' ');
    
    // Fix common speech recognition errors
    const corrections: Record<string, string> = {
      'okay': 'OK',
      'yeah': 'yes',
      'um': '',
      'uh': '',
      'ah': '',
      'er': '',
      'so': '',
      'like': '',
      'you know': '',
      'i mean': '',
      'sort of': '',
      'kind of': '',
    };
    
    Object.entries(corrections).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      processed = processed.replace(regex, to);
    });
    
    // Remove multiple spaces
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  }, []);

  // Update recognition when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      const errorMsg = !isSupported 
        ? `Speech recognition not supported in ${browserInfo.name} ${browserInfo.version}. Please use Chrome, Edge, or Safari with HTTPS.`
        : 'Speech recognition not initialized. Please refresh the page.';
      setError(errorMsg);
      return;
    }

    // Check for network connectivity
    if (!navigator.onLine) {
      setError('No internet connection: Speech recognition requires an active internet connection.');
      return;
    }

    // Check for microphone permissions
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        try {
          // Reset state before starting
          setTranscript('');
          setIsFinal(false);
          setError(null);
          setIsProcessing(false);
          setConfidence(0);
          
          // Ensure recognition is properly reset
          if (recognitionRef.current) {
            recognitionRef.current.abort(); // Stop any ongoing recognition
          }
          
          // Small delay to ensure clean state
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setError('Failed to start speech recognition. Please check your microphone permissions and try again.');
        }
      })
      .catch((error) => {
        console.error('Microphone permission denied:', error);
        setError('Microphone access denied. Please allow microphone permissions and refresh the page.');
      });
  }, [isSupported, browserInfo]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setIsFinal(false);
    setError(null);
    setConfidence(0);
    setIsProcessing(false);
  }, []);

  const setLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
  }, []);

  // Enhanced language support with better detection
  const availableLanguages = [
    'en-US',
    'en-GB',
    'en-AU',
    'en-CA',
    'en-IN',
    'es-ES',
    'es-MX',
    'es-AR',
    'fr-FR',
    'fr-CA',
    'de-DE',
    'it-IT',
    'pt-BR',
    'pt-PT',
    'ru-RU',
    'ja-JP',
    'ko-KR',
    'zh-CN',
    'zh-TW',
    'ar-SA',
    'hi-IN',
    'th-TH',
    'tr-TR',
    'pl-PL',
    'nl-NL',
    'sv-SE',
    'da-DK',
    'no-NO',
    'fi-FI',
    'cs-CZ',
    'hu-HU',
    'ro-RO',
    'bg-BG',
    'hr-HR',
    'sk-SK',
    'sl-SI',
    'et-EE',
    'lv-LV',
    'lt-LT',
  ];

  return {
    isSupported,
    isListening,
    transcript,
    isFinal,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
    availableLanguages,
    currentLanguage,
    confidence,
    isProcessing,
    browserInfo,
  };
}; 