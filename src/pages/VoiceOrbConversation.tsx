import React, { useEffect, useState, useRef } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { X, Mic, Volume2, AlertTriangle, Wifi, WifiOff, Info, CheckCircle, XCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMultipleWebhooks } from '../hooks/useMultipleWebhooks';
import { Button } from '@/components/ui/button';

// Speaking states
type SpeakingState = 'idle' | 'user-speaking' | 'ai-speaking' | 'processing';

// Browser compatibility component
const BrowserCompatibilityInfo: React.FC<{ browserInfo: any }> = ({ browserInfo }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCompatibilityStatus = () => {
    if (browserInfo.isSecure && (browserInfo.supportsSpeechRecognition || browserInfo.supportsWebkitSpeechRecognition)) {
      return { status: 'supported', message: 'Your browser supports speech recognition' };
    } else if (!browserInfo.isSecure) {
      return { status: 'https-required', message: 'HTTPS connection required' };
    } else {
      return { status: 'not-supported', message: 'Speech recognition not supported' };
    }
  };

  const status = getCompatibilityStatus();

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        {status.status === 'supported' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <span className="font-medium text-gray-900 dark:text-white">{status.message}</span>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        <div>Browser: {browserInfo.name} {browserInfo.version}</div>
        <div>Connection: {browserInfo.isSecure ? 'Secure (HTTPS)' : 'Not Secure (HTTP)'}</div>
        <div>Speech Recognition: {browserInfo.supportsSpeechRecognition ? 'Supported' : 'Not Supported'}</div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showDetails ? 'Hide' : 'Show'} troubleshooting tips
      </button>

      {showDetails && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="font-medium text-gray-700 dark:text-gray-300">Troubleshooting:</div>
          <ul className="space-y-1">
            <li>• Use Chrome, Edge, or Safari</li>
            <li>• Ensure you're on HTTPS or localhost</li>
            <li>• Allow microphone permissions</li>
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Orb animation: pulse when user or AI is speaking
const GlowingOrb: React.FC<{ speakingState: SpeakingState; confidence?: number }> = ({ speakingState, confidence = 0 }) => {
  const isActive = speakingState !== 'idle';
  const isUserSpeaking = speakingState === 'user-speaking';
  const isAISpeaking = speakingState === 'ai-speaking';
  const isProcessing = speakingState === 'processing';

  // Color schemes for different states
  const getColors = () => {
    switch (speakingState) {
      case 'user-speaking':
        return {
          outerGlow: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.08) 80%, transparent 100%)',
          mainOrb: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(37,99,235,0.30) 100%)',
          innerOrb: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.15) 80%, transparent 100%)',
          border: 'rgba(59,130,246,0.25)',
          shadow: 'rgba(59,130,246,0.35)',
          pulseShadow: 'rgba(59,130,246,0.45)'
        };
      case 'ai-speaking':
        return {
          outerGlow: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.08) 80%, transparent 100%)',
          mainOrb: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.30) 100%)',
          innerOrb: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0.15) 80%, transparent 100%)',
          border: 'rgba(16,185,129,0.25)',
          shadow: 'rgba(16,185,129,0.35)',
          pulseShadow: 'rgba(16,185,129,0.45)'
        };
      case 'processing':
        return {
          outerGlow: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.08) 80%, transparent 100%)',
          mainOrb: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(217,119,6,0.30) 100%)',
          innerOrb: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(245,158,11,0.15) 80%, transparent 100%)',
          border: 'rgba(245,158,11,0.25)',
          shadow: 'rgba(245,158,11,0.35)',
          pulseShadow: 'rgba(245,158,11,0.45)'
        };
      default:
        return {
          outerGlow: 'radial-gradient(circle, rgba(180,160,255,0.18) 0%, rgba(180,160,255,0.04) 80%, transparent 100%)',
          mainOrb: 'linear-gradient(135deg, rgba(180,160,255,0.18) 0%, rgba(120,80,255,0.22) 100%)',
          innerOrb: 'radial-gradient(circle, rgba(200,180,255,0.25) 0%, rgba(180,160,255,0.10) 80%, transparent 100%)',
          border: 'rgba(200,180,255,0.18)',
          shadow: 'rgba(180,160,255,0.25)',
          pulseShadow: 'rgba(180,160,255,0.35)'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer glow */}
        <div
          className={`rounded-full transition-all duration-500 pointer-events-none 
            ${isActive ? 'animate-orb-glow' : ''}
          `}
          style={{
            width: 420,
            height: 420,
            background: colors.outerGlow,
            filter: isActive ? 'blur(32px)' : 'blur(48px)',
            opacity: isActive ? 1 : 0.7,
            zIndex: 1,
          }}
        />
      </div>
      <div className="relative z-10 flex items-center justify-center">
        {/* Main orb */}
        <div
          className={`rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center 
            ${isActive ? 'animate-orb-pulse' : ''}
          `}
          style={{
            width: 260,
            height: 260,
            background: colors.mainOrb,
            boxShadow: isActive
              ? `0 0 80px 24px ${colors.shadow}, 0 0 0 8px ${colors.border}`
              : `0 0 60px 12px ${colors.shadow}`,
            border: `1.5px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner orb */}
          <div
            className={`rounded-full transition-all duration-300 ${isActive ? 'animate-orb-inner' : ''}`}
            style={{
              width: 110,
              height: 110,
              background: colors.innerOrb,
              boxShadow: isActive
                ? `0 0 40px 8px ${colors.shadow}`
                : `0 0 20px 4px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
            }}
          />
        </div>
      </div>

      {/* Speaking indicator icon */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm
            ${isUserSpeaking 
              ? 'bg-blue-500/20 border border-blue-400/30' 
              : isAISpeaking
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-yellow-500/20 border border-yellow-400/30'
            } animate-pulse`}>
            {isUserSpeaking ? (
              <Mic className="w-8 h-8 text-blue-400" />
            ) : isAISpeaking ? (
              <Volume2 className="w-8 h-8 text-green-400" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence indicator for user speaking */}
      {isUserSpeaking && confidence > 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Status text */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium transition-all duration-300
          ${isUserSpeaking 
            ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30' 
            : isAISpeaking 
            ? 'bg-green-500/20 text-green-200 border border-green-400/30'
            : isProcessing
            ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30'
            : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
          }`}>
          {isUserSpeaking ? 'You are speaking...' : isAISpeaking ? 'AI is speaking...' : isProcessing ? 'Processing...' : 'Ready to listen'}
        </div>
      </div>
    </div>
  );
};

// Simplified AI response function
async function getAIResponse(userMessage: string, webhookUrl: string): Promise<string> {
  try {
    console.log('Sending to webhook:', userMessage);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        timestamp: new Date().toISOString(),
        user_id: 'voice-orb-user'
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Webhook response:', data);

    // Extract text from response
    let text = '';
    if (data.output && typeof data.output === 'object' && data.output.text) {
      text = data.output.text;
    } else if (data.output && typeof data.output === 'string') {
      text = data.output;
    } else if (data.response) {
      text = data.response;
    } else if (data.message) {
      text = data.message;
    } else {
      text = JSON.stringify(data);
    }

    console.log('Extracted text:', text);
    return text;
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

const VoiceOrbConversation: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const {
    isListening: userSpeaking,
    transcript,
    isFinal,
    startListening,
    stopListening,
    resetTranscript,
    confidence,
    error: sttError,
    isSupported: sttSupported,
    browserInfo,
  } = useSpeechToText();
  
  const {
    isSpeaking: aiSpeaking,
    speak,
    stop: stopTTS,
  } = useTextToSpeech();
  
  const [speakingState, setSpeakingState] = useState<SpeakingState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  
  // Get webhook configuration and chat messages
  const { getCurrentWebhookUrl, isWebhookConfigured } = useMultipleWebhooks();

  // Manage speaking state
  useEffect(() => {
    if (userSpeaking) {
      setSpeakingState('user-speaking');
    } else if (aiSpeaking) {
      setSpeakingState('ai-speaking');
    } else if (isProcessing) {
      setSpeakingState('processing');
    } else {
      setSpeakingState('idle');
    }
  }, [userSpeaking, aiSpeaking, isProcessing]);

  // Start listening on mount
  useEffect(() => {
    if (sttSupported) {
      console.log('Starting speech recognition on mount');
      startListening();
    } else {
      console.log('Speech recognition not supported');
      setShowBrowserInfo(true);
    }
  }, [sttSupported, startListening]);

  // Handle speech recognition errors
  useEffect(() => {
    if (sttError) {
      console.error('Speech recognition error:', sttError);
      setError(sttError);
      setTimeout(() => setError(null), 5000);
    }
  }, [sttError]);

  // Auto-restart listening if it stops unexpectedly
  useEffect(() => {
    if (!userSpeaking && !isProcessing && sttSupported && !sttError) {
      const restartTimer = setTimeout(() => {
        console.log('Auto-restarting speech recognition');
        startListening();
      }, 3000); // Restart after 3 seconds of inactivity
      
      return () => clearTimeout(restartTimer);
    }
  }, [userSpeaking, isProcessing, sttSupported, sttError, startListening]);

  // Process speech and get AI response
  useEffect(() => {
    if (isFinal && transcript.trim()) {
      const userMsg = transcript.trim();
      console.log('Processing:', userMsg);
      
      // Stop TTS immediately when user starts speaking
      stopTTS();
      
      // Stop listening
      stopListening();
      resetTranscript();
      setIsProcessing(true);
      
      // Get AI response
      const webhookUrl = getCurrentWebhookUrl();
      if (webhookUrl && isWebhookConfigured()) {
        getAIResponse(userMsg, webhookUrl)
          .then((aiMsg) => {
            console.log('AI response:', aiMsg);
            
            // Speak the response
            speak(aiMsg, {
              onStart: () => {
                console.log('TTS started');
                setIsProcessing(false);
              },
              onEnd: () => {
                console.log('TTS ended, resuming listening');
                // Resume listening after 1 second
                setTimeout(() => {
                  console.log('Restarting speech recognition after TTS');
                  startListening();
                }, 1000);
              },
              onError: (error) => {
                console.error('TTS error:', error);
                setIsProcessing(false);
                setTimeout(() => {
                  console.log('Restarting speech recognition after TTS error');
                  startListening();
                }, 1000);
              }
            });
          })
          .catch((error) => {
            console.error('AI error:', error);
            setIsProcessing(false);
            setTimeout(() => {
              console.log('Restarting speech recognition after AI error');
              startListening();
            }, 2000);
          });
      } else {
        console.log('No webhook configured');
        setIsProcessing(false);
        setTimeout(() => {
          console.log('Restarting speech recognition (no webhook)');
          startListening();
        }, 2000);
      }
    }
  }, [isFinal, transcript, stopListening, resetTranscript, getCurrentWebhookUrl, isWebhookConfigured, speak, startListening, stopTTS]);

  // Stop TTS when user starts speaking (interim results)
  useEffect(() => {
    if (transcript && !isFinal && transcript.length > 5) {
      // User is speaking, stop TTS
      console.log('User speaking, stopping TTS');
      stopTTS();
    }
  }, [transcript, isFinal, stopTTS]);

  // Check authentication status
  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full min-h-screen bg-gradient-to-br from-[#eae6fa] via-[#d6d0f7] to-[#bdb6e6] dark:from-[#18162a] dark:via-[#2a2540] dark:to-[#18162a] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full min-h-screen bg-gradient-to-br from-[#eae6fa] via-[#d6d0f7] to-[#bdb6e6] dark:from-[#18162a] dark:via-[#2a2540] dark:to-[#18162a] flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be signed in to access the voice orb conversation feature. Please log in to continue.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/welcome')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-gradient-to-br from-[#eae6fa] via-[#d6d0f7] to-[#bdb6e6] dark:from-[#18162a] dark:via-[#2a2540] dark:to-[#18162a] flex flex-col items-center justify-center z-50">
      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-8 z-20 bg-white/60 dark:bg-black/40 rounded-full p-3 shadow-lg hover:bg-white/80 dark:hover:bg-black/60 transition-all"
      >
        <X className="w-7 h-7 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Browser info button */}
      <button
        onClick={() => setShowBrowserInfo(!showBrowserInfo)}
        className="absolute top-6 left-8 z-20 bg-white/60 dark:bg-black/40 rounded-full p-3 shadow-lg hover:bg-white/80 dark:hover:bg-black/60 transition-all"
      >
        <Info className="w-7 h-7 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Browser compatibility info */}
      {showBrowserInfo && (
        <BrowserCompatibilityInfo browserInfo={browserInfo} />
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-500/20 text-red-200 border border-red-400/30 rounded-lg px-4 py-2 text-sm backdrop-blur-sm max-w-md">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Debug status indicator */}
      <div className="absolute top-32 left-8 z-20 bg-black/60 text-white rounded-lg px-3 py-2 text-xs backdrop-blur-sm max-w-xs">
        <div className="font-medium mb-1">Debug Status:</div>
        <div>STT Supported: {sttSupported ? 'Yes' : 'No'}</div>
        <div>STT Listening: {userSpeaking ? 'Yes' : 'No'}</div>
        <div>TTS Speaking: {aiSpeaking ? 'Yes' : 'No'}</div>
        <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
        <div>Final: {isFinal ? 'Yes' : 'No'}</div>
        <div>Transcript: {transcript ? `"${transcript}"` : 'None'}</div>
        <div>Webhook: {isWebhookConfigured() ? 'Configured' : 'Not Configured'}</div>
        <div>Error: {sttError || 'None'}</div>
      </div>

      {/* Glowing Orb */}
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <GlowingOrb speakingState={speakingState} confidence={confidence} />
      </div>

      {/* Custom orb animations */}
      <style>{`
        @keyframes orb-glow {
          0%, 100% { opacity: 0.7; filter: blur(48px); }
          50% { opacity: 1; filter: blur(32px); }
        }
        .animate-orb-glow {
          animation: orb-glow 1.6s infinite cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes orb-pulse {
          0%, 100% { 
            box-shadow: 0 0 80px 24px rgba(180,160,255,0.25), 0 0 0 8px rgba(180,160,255,0.08); 
          }
          50% { 
            box-shadow: 0 0 120px 40px rgba(180,160,255,0.35), 0 0 0 16px rgba(180,160,255,0.16); 
          }
        }
        .animate-orb-pulse {
          animation: orb-pulse 1.6s infinite cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes orb-inner {
          0%, 100% { box-shadow: 0 0 40px 8px rgba(180,160,255,0.25); }
          50% { box-shadow: 0 0 80px 24px rgba(180,160,255,0.35); }
        }
        .animate-orb-inner {
          animation: orb-inner 1.6s infinite cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default VoiceOrbConversation; 