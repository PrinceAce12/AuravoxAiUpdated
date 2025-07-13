import React, { useState, useEffect } from 'react';
import { VoiceConversation } from '../components/chat/VoiceConversation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, MicOff, Volume2, Settings, AlertTriangle, Info, Lock } from 'lucide-react';
import { useTheme } from '../components/providers/ThemeProvider';
import { useAuth } from '../hooks/useAuth';
import { detectBrowser, getBrowserCompatibilityMessage, getBrowserRecommendations } from '../lib/browserCompatibility';

const VoiceChat: React.FC = () => {
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showVoiceConversation, setShowVoiceConversation] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading } = useAuth();

  // Browser compatibility
  const browserSupport = detectBrowser();
  const compatibilityMessage = getBrowserCompatibilityMessage(browserSupport);
  const recommendations = getBrowserRecommendations(browserSupport);

  // Pulse animation effect
  useEffect(() => {
    if (isVoiceListening) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isVoiceListening]);

  const handleSendMessage = (message: string) => {
    // For now, just log or you could integrate with your backend/chatbot
    console.log('Voice message:', message);
  };

  // Check authentication status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be signed in to access the voice chat feature. Please log in to continue.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Chat
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                AI Voice Interface
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Neural Speech Recognition & Synthesis
              </p>
            </div>

            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Browser Compatibility Warning */}
        {compatibilityMessage && (
          <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="bg-yellow-100 dark:bg-yellow-500/10 backdrop-blur-sm rounded-lg p-4 border border-yellow-200/50 dark:border-yellow-500/20 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Browser Compatibility Notice
                  </h3>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                    {compatibilityMessage}
                  </p>
                  
                  {recommendations.length > 0 && (
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium mb-1">Recommendations:</p>
                      <ul className="space-y-0.5">
                        {recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowBrowserInfo(!showBrowserInfo)}
                    className="mt-2 text-xs h-6 px-2 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-500/20"
                  >
                    <Info className="w-3 h-3 mr-1" />
                    {showBrowserInfo ? 'Hide' : 'Show'} Browser Info
                  </Button>

                  {showBrowserInfo && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-500/5 rounded text-xs">
                      <pre className="text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                        {`Browser: ${browserSupport.browserName} ${browserSupport.browserVersion}
Speech Recognition: ${browserSupport.speechRecognition ? '✅' : '❌'}
Text-to-Speech: ${browserSupport.speechSynthesis ? '✅' : '❌'}
Secure Connection: ${browserSupport.isSecure ? '✅' : '❌'}
Mobile: ${browserSupport.isMobile ? 'Yes' : 'No'}
Brave: ${browserSupport.isBrave ? 'Yes' : 'No'}`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Voice Interface */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative">
            {/* Central Voice Orb */}
            <div className="flex justify-center mb-8">
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                isVoiceListening 
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 shadow-2xl shadow-blue-500/50' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700'
              }`}>
                
                {/* Pulse rings when listening */}
                {isVoiceListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping delay-300"></div>
                    <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping delay-600"></div>
                  </>
                )}

                {/* Icon */}
                <div className="relative z-10">
                  {isVoiceListening ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-white/10 shadow-lg">
                <div className={`w-3 h-3 rounded-full ${
                  isVoiceListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {isVoiceListening ? 'Listening...' : 'Ready for voice input'}
                </span>
              </div>
            </div>

            {/* Voice Conversation Modal */}
            {showVoiceConversation && (
              <div className="relative">
                <VoiceConversation
                  onSendMessage={handleSendMessage}
                  isListening={isVoiceListening}
                  onToggleListening={() => setIsVoiceListening(!isVoiceListening)}
                  onClose={() => navigate('/')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info Panel */}
        <div className="w-full max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Speech Recognition</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Real-time voice-to-text conversion with multi-language support
              </p>
            </div>

            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Voice Synthesis</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Natural AI voice responses with customizable settings
              </p>
            </div>

            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Neural Processing</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Advanced AI conversation with contextual understanding
              </p>
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/30 dark:bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 