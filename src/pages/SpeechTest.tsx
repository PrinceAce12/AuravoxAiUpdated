import React, { useState } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Mic, Volume2, AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';

const SpeechTest: React.FC = () => {
  const {
    isListening,
    transcript,
    isFinal,
    startListening,
    stopListening,
    resetTranscript,
    confidence,
    isProcessing,
    error,
    isSupported,
    browserInfo,
  } = useSpeechToText();

  const {
    isSpeaking,
    speak,
    stop: stopTTS,
    currentText,
  } = useTextToSpeech();

  const [testMessage, setTestMessage] = useState('Hello, this is a test of text-to-speech functionality.');

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isSupported) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-5 h-5" />;
    if (isSupported) return <CheckCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Speech Recognition & TTS Test</h1>
        
        {/* Browser Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Browser Compatibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Browser:</strong> {browserInfo.name} {browserInfo.version}</p>
              <p><strong>User Agent:</strong> <span className="text-xs break-all">{browserInfo.userAgent}</span></p>
            </div>
            <div>
              <p><strong>Secure Connection:</strong> {browserInfo.isSecure ? 'Yes' : 'No'}</p>
              <p><strong>Speech Recognition:</strong> {browserInfo.supportsSpeechRecognition ? 'Supported' : 'Not Supported'}</p>
              <p><strong>Webkit Speech Recognition:</strong> {browserInfo.supportsWebkitSpeechRecognition ? 'Supported' : 'Not Supported'}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {error || (isSupported ? 'Speech recognition is supported' : 'Speech recognition not supported')}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Use Chrome, Edge, or Safari browser</li>
                <li>• Ensure you're on HTTPS or localhost</li>
                <li>• Allow microphone permissions when prompted</li>
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Make sure your microphone is working</li>
              </ul>
            </div>
          )}
        </div>

        {/* Speech Recognition Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Speech Recognition Test
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={startListening}
                disabled={!isSupported || isListening}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isListening ? 'Listening...' : 'Start Listening'}
              </button>
              <button
                onClick={stopListening}
                disabled={!isListening}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop Listening
              </button>
              <button
                onClick={resetTranscript}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <p><strong>Status:</strong> {isListening ? 'Listening' : isProcessing ? 'Processing' : 'Idle'}</p>
              <p><strong>Confidence:</strong> {(confidence * 100).toFixed(1)}%</p>
              <p><strong>Is Final:</strong> {isFinal ? 'Yes' : 'No'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium mb-2">Transcript:</p>
              <p className="text-gray-700 dark:text-gray-300 min-h-[2rem]">
                {transcript || 'No transcript yet...'}
              </p>
            </div>
          </div>
        </div>

        {/* Text-to-Speech Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Text-to-Speech Test
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Message:</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => speak(testMessage)}
                disabled={isSpeaking}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpeaking ? 'Speaking...' : 'Speak'}
              </button>
              <button
                onClick={stopTTS}
                disabled={!isSpeaking}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop Speaking
              </button>
            </div>

            <div className="space-y-2">
              <p><strong>Status:</strong> {isSpeaking ? 'Speaking' : 'Idle'}</p>
              {isSpeaking && <p><strong>Current Text:</strong> {currentText}</p>}
            </div>
          </div>
        </div>

        {/* Quick Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Test</h2>
          <div className="space-y-4">
            <button
              onClick={() => {
                speak('Hello, this is a quick test of the text-to-speech functionality.');
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Test TTS
            </button>
            
            <button
              onClick={() => {
                resetTranscript();
                startListening();
                setTimeout(() => {
                  stopListening();
                }, 5000);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Test STT (5 seconds)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechTest; 