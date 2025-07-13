import { useState, useEffect, useCallback, useRef } from 'react';

interface Voice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: Voice;
  readFullResponse?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  availableVoices: Voice[];
  selectedVoice: Voice | null;
  speak: (text: string, options?: TTSOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  toggleMute: () => void;
  setVoice: (voice: Voice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  isPaused: boolean;
  currentText: string;
  speakQueue: string[];
  clearQueue: () => void;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [rate, setRateState] = useState(1);
  const [pitch, setPitchState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [currentText, setCurrentText] = useState('');
  const [speakQueue, setSpeakQueue] = useState<string[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const queueRef = useRef<string[]>([]);

  // Check if speech synthesis is supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      setIsSupported(supported);
      
      if (supported) {
        synthesisRef.current = window.speechSynthesis;
        
        // Fix for Chrome's speech synthesis bug
        if (window.speechSynthesis.onvoiceschanged === undefined) {
          window.speechSynthesis.onvoiceschanged = () => {};
        }
      }
    };

    checkSupport();
  }, []);

  // Load available voices with enhanced filtering
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        
        // Enhanced voice filtering and sorting
        const enhancedVoices = voices
          .filter(voice => {
            // Filter out low-quality voices
            const excludedNames = ['Google', 'Microsoft', 'SAPI', 'IVONA'];
            return !excludedNames.some(name => voice.name.includes(name));
          })
          .sort((a, b) => {
            // Prioritize high-quality voices
            const qualityScore = (voice: Voice) => {
              let score = 0;
              if (voice.localService) score += 10;
              if (voice.default) score += 5;
              if (voice.name.includes('Premium')) score += 3;
              if (voice.name.includes('Enhanced')) score += 2;
              if (voice.lang.startsWith('en')) score += 1;
              return score;
            };
            
            return qualityScore(b) - qualityScore(a);
          });
        
        setAvailableVoices(enhancedVoices);
        
        // Select the best available voice
        if (enhancedVoices.length > 0) {
          const preferredVoice = enhancedVoices.find(voice => 
            voice.default && voice.localService
          ) || enhancedVoices.find(voice => 
            voice.lang.startsWith('en') && voice.localService
          ) || enhancedVoices[0];
          
          setSelectedVoice(preferredVoice);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Listen for voices loaded event
    const handleVoicesChanged = () => {
      loadVoices();
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [isSupported]);

  // Enhanced speech processing
  const processTextForSpeech = useCallback((text: string): string => {
    if (!text) return '';
    
    let processed = text;
    
    // Remove robot faces and common AI prefixes from the beginning
    processed = processed.replace(/^🤖\s*/, ''); // Remove robot emoji
    processed = processed.replace(/^👾\s*/, ''); // Remove alien emoji
    processed = processed.replace(/^🤖\s*/, ''); // Remove robot emoji (different encoding)
    processed = processed.replace(/^Robot:\s*/i, ''); // Remove "Robot:" prefix
    processed = processed.replace(/^AI:\s*/i, ''); // Remove "AI:" prefix
    processed = processed.replace(/^Assistant:\s*/i, ''); // Remove "Assistant:" prefix
    processed = processed.replace(/^Bot:\s*/i, ''); // Remove "Bot:" prefix
    processed = processed.replace(/^Hello! I'm here to help\.\s*/i, ''); // Remove common greeting
    processed = processed.replace(/^Hi! How can I help you today\?\s*/i, ''); // Remove common greeting
    processed = processed.replace(/^How can I help you today\?\s*/i, ''); // Remove common greeting
    
    // Remove markdown and code blocks for speech
    processed = processed.replace(/```[\s\S]*?```/g, '');
    processed = processed.replace(/`[^`]*`/g, '');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '$1');
    processed = processed.replace(/\*(.*?)\*/g, '$1');
    processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    processed = processed.replace(/^> (.+)$/gm, '$1');
    processed = processed.replace(/^[-*] (.+)$/gm, '$1');
    processed = processed.replace(/^\d+\. (.+)$/gm, '$1');
    
    // Remove JSON formatting and quotes
    processed = processed.replace(/^["']|["']$/g, ''); // Remove outer quotes
    processed = processed.replace(/\\"/g, '"'); // Unescape quotes
    processed = processed.replace(/\\n/g, ' '); // Replace newlines with spaces
    processed = processed.replace(/\\t/g, ' '); // Replace tabs with spaces
    
    // Clean up extra whitespace
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Add natural pauses for better speech flow
    processed = processed.replace(/\./g, '... ');
    processed = processed.replace(/!/g, '... ');
    processed = processed.replace(/\?/g, '... ');
    processed = processed.replace(/,/g, ', ');
    
    // Ensure the text ends with a pause
    if (!processed.endsWith('...')) {
      processed += '...';
    }
    
    console.log('Original text:', text);
    console.log('Processed for speech:', processed);
    
    return processed;
  }, []);

  // Main speak function with enhanced options
  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    if (!isSupported || !synthesisRef.current) {
      console.error('Speech synthesis not supported');
      options.onError?.('Speech synthesis not supported');
      return;
    }

    if (isMuted) {
      console.log('Speech synthesis is muted');
      return;
    }

    // Stop any current speech and wait a moment
    if (utteranceRef.current || synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      utteranceRef.current = null;
      
      // Small delay to ensure clean state
      setTimeout(() => {
        speak(text, options);
      }, 200);
      return;
    }

    // Process text for better speech
    const processedText = processTextForSpeech(text);
    
    if (!processedText.trim()) {
      console.warn('No text to speak after processing');
      options.onError?.('No text to speak');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(processedText);
      utteranceRef.current = utterance;

      // Set voice
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Set speech parameters
      utterance.rate = options.rate || rate;
      utterance.pitch = options.pitch || pitch;
      utterance.volume = options.volume || volume;

      // Enhanced event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setCurrentText(processedText);
        console.log('Speech synthesis started:', processedText.substring(0, 50) + '...');
        options.onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentText('');
        utteranceRef.current = null;
        console.log('Speech synthesis ended');
        options.onEnd?.();
        // Auto-resume listening immediately after speech ends
        setTimeout(() => {
          startListening();
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentText('');
        utteranceRef.current = null;
        options.onError?.(event.error);
      };

      utterance.onpause = () => {
        setIsPaused(true);
        console.log('Speech synthesis paused');
      };

      utterance.onresume = () => {
        setIsPaused(false);
        console.log('Speech synthesis resumed');
      };

      // Start speaking
      synthesisRef.current.speak(utterance);
      
    } catch (error) {
      console.error('Error creating speech utterance:', error);
      options.onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [isSupported, isMuted, selectedVoice, rate, pitch, volume, processTextForSpeech]);

  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
      utteranceRef.current = null;
      
      // Clear queue
      queueRef.current = [];
      setSpeakQueue([]);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthesisRef.current && isPaused) {
      synthesisRef.current.resume();
    }
  }, [isPaused]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (isSpeaking) {
      stop();
    }
  }, [isSpeaking, stop]);

  const setVoice = useCallback((voice: Voice) => {
    setSelectedVoice(voice);
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setPitchState(Math.max(0, Math.min(2, newPitch)));
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setSpeakQueue([]);
  }, []);

  return {
    isSupported,
    isSpeaking,
    isMuted,
    availableVoices,
    selectedVoice,
    speak,
    stop,
    pause,
    resume,
    toggleMute,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    isPaused,
    currentText,
    speakQueue,
    clearQueue,
  };
}; 