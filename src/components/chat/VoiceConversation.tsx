import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, X, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { cleanTextForSpeech, shouldSpeakText, extractSpeechText } from '../../lib/speechUtils';
import { detectBrowser, getBrowserCompatibilityMessage, getBrowserRecommendations, getSupportedBrowsers, getNetworkErrorTroubleshooting } from '../../lib/browserCompatibility';

interface VoiceConversationProps {
  onSendMessage: (message: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  onClose: () => void;
}

export const VoiceConversation: React.FC<VoiceConversationProps> = ({
  onSendMessage,
  isListening,
  onToggleListening,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoSend, setAutoSend] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  const [showNetworkTroubleshooting, setShowNetworkTroubleshooting] = useState(false);

  // Browser compatibility
  const browserSupport = detectBrowser();
  const compatibilityMessage = getBrowserCompatibilityMessage(browserSupport);
  const recommendations = getBrowserRecommendations(browserSupport);
  const supportedBrowsers = getSupportedBrowsers();
  const networkTroubleshooting = getNetworkErrorTroubleshooting();

  // Speech-to-Text
  const {
    isSupported: sttSupported,
    isListening: sttListening,
    transcript,
    isFinal,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
    availableLanguages,
    currentLanguage,
  } = useSpeechToText();

  // Text-to-Speech
  const {
    isSupported: ttsSupported,
    isSpeaking,
    isMuted,
    availableVoices,
    selectedVoice,
    speak,
    stop: stopTTS,
    toggleMute,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  } = useTextToSpeech();

  // Auto-send when speech is final
  useEffect(() => {
    if (autoSend && isFinal && transcript.trim()) {
      const cleanedTranscript = processTranscript(transcript.trim());
      onSendMessage(cleanedTranscript);
      resetTranscript();
      // Immediately start listening for next input
      startListening();
    }
  }, [isFinal, transcript, autoSend, onSendMessage, resetTranscript]);

  // Handle listening state
  const handleToggleListening = useCallback(() => {
    if (sttListening) {
      stopListening();
    } else {
      startListening();
    }
    onToggleListening();
  }, [sttListening, stopListening, startListening, onToggleListening]);

  // Manual send
  const handleSend = useCallback(() => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      resetTranscript();
    }
  }, [transcript, onSendMessage, resetTranscript]);

  // Clear transcript
  const handleClear = useCallback(() => {
    resetTranscript();
  }, [resetTranscript]);

  // Check if we have any speech support
  const hasAnySpeechSupport = sttSupported || ttsSupported;

  // Check if error is network-related
  const isNetworkError = sttError?.toLowerCase().includes('network') || sttError?.toLowerCase().includes('internet');

  if (!hasAnySpeechSupport) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-6 max-w-md mx-4 border border-gray-200/50 dark:border-white/10 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Voice Not Supported</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {compatibilityMessage || 'Your browser doesn\'t support speech recognition. Please use Chrome, Edge, or Safari.'}
            </p>
            
            {/* Browser Recommendations */}
            {recommendations.length > 0 && (
              <div className="mb-4 text-left">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supported Browsers */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supported Browsers:</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {supportedBrowsers.map((browser) => (
                  <div key={browser.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-700 dark:text-gray-300">{browser.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{browser.features.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Info Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBrowserInfo(!showBrowserInfo)}
              className="mb-4 text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              {showBrowserInfo ? 'Hide' : 'Show'} Browser Info
            </Button>

            {showBrowserInfo && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-left">
                <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {`Browser: ${browserSupport.browserName} ${browserSupport.browserVersion}
Speech Recognition: ${browserSupport.speechRecognition ? '✅' : '❌'}
Text-to-Speech: ${browserSupport.speechSynthesis ? '✅' : '❌'}
Secure Connection: ${browserSupport.isSecure ? '✅' : '❌'}
Network Status: ${browserSupport.isOnline ? '✅ Online' : '❌ Offline'}
Mobile: ${browserSupport.isMobile ? 'Yes' : 'No'}
Brave: ${browserSupport.isBrave ? 'Yes' : 'No'}`}
                </pre>
              </div>
            )}

            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-6 max-w-lg mx-4 w-full border border-gray-200/50 dark:border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Neural Voice Interface</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Network Status Warning */}
        {!browserSupport.isOnline && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 rounded-lg border border-red-200/50 dark:border-red-500/20">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">No Internet Connection</p>
                <p>Speech recognition requires an active internet connection to work properly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Browser Warning for Brave */}
        {browserSupport.isBrave && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg border border-yellow-200/50 dark:border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <p className="font-medium mb-1">Brave Browser Detected</p>
                <p>You may need to enable microphone permissions in Brave Shields settings for voice features to work properly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${sttListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {sttListening ? 'Listening...' : 'Click microphone to start'}
            </span>
          </div>
          {sttError && (
            <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-lg border border-red-200/50 dark:border-red-500/20">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Speech Recognition Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{sttError}</p>
                </div>
              </div>
              
              {/* Network Error Troubleshooting */}
              {isNetworkError && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowNetworkTroubleshooting(!showNetworkTroubleshooting)}
                    className="text-xs h-6 px-2 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/20"
                  >
                    <Wifi className="w-3 h-3 mr-1" />
                    {showNetworkTroubleshooting ? 'Hide' : 'Show'} Network Troubleshooting
                  </Button>
                  
                  {showNetworkTroubleshooting && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-500/5 rounded text-xs">
                      <p className="font-medium text-red-700 dark:text-red-300 mb-1">Troubleshooting Steps:</p>
                      <ul className="space-y-0.5 text-red-600 dark:text-red-400">
                        {networkTroubleshooting.map((step, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span>{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Transcript</Label>
          <div className="bg-gray-50 dark:bg-black/40 backdrop-blur-sm rounded-lg p-3 min-h-[80px] max-h-[120px] overflow-y-auto border border-gray-200/50 dark:border-white/10">
            {transcript ? (
              <p className="text-sm text-gray-900 dark:text-white">{transcript}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Start speaking...</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleToggleListening}
            className={`flex-1 transition-all duration-300 ${
              sttListening 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
            }`}
            disabled={!sttSupported || !browserSupport.isOnline}
          >
            {sttListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          {transcript && (
            <>
              <Button onClick={handleSend} variant="outline" size="sm" className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                Send
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm" className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Settings */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Neural Settings
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4 bg-gray-50 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-white/10">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-gray-300">
                Neural Language
              </Label>
              <Select value={currentLanguage} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 bg-white dark:bg-black/40 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/20">
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Settings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-700 dark:text-gray-300">
                  Auto Send
                </Label>
                <button
                  onClick={() => setAutoSend(!autoSend)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    autoSend 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      autoSend ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatically send message when speech ends
              </p>
            </div>

            {/* TTS Settings */}
            {ttsSupported && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-700 dark:text-gray-300">
                      Auto Speak Responses
                    </Label>
                    <button
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        autoSpeak 
                          ? 'bg-gradient-to-r from-purple-500 to-cyan-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          autoSpeak ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Automatically speak assistant responses
                  </p>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-700 dark:text-gray-300">
                    Neural Voice
                  </Label>
                  <Select
                    value={selectedVoice?.voiceURI || ''}
                    onValueChange={(value) => {
                      const voice = availableVoices.find(v => v.voiceURI === value);
                      if (voice) setVoice(voice);
                    }}
                  >
                    <SelectTrigger className="h-8 bg-white dark:bg-black/40 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/20">
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speech Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-gray-700 dark:text-gray-300">
                      Neural Speed
                    </Label>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      100%
                    </span>
                  </div>
                  <Slider
                    value={[1]}
                    onValueChange={([value]) => setRate(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-500/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Neural Interface:</strong> Click the microphone to start speaking. 
            Your speech will be converted to text and sent to the AI. 
            The assistant's response will be spoken back to you.
          </p>
        </div>
      </div>
    </div>
  );
}; 