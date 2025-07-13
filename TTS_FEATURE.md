# Voice Features - Text-to-Speech & Voice Conversation

## Overview

The chatbot now includes comprehensive voice features with both text-to-speech (TTS) and speech-to-text (STT) capabilities, enabling full voice conversations with the assistant.

## Features

### Text-to-Speech (TTS)
- **Automatic Speech**: Assistant messages are automatically read aloud when they appear
- **Full Response Reading**: Reads the complete assistant response by default
- **Smart Text Processing**: Removes code blocks, markdown formatting, and HTML tags
- **Configurable Options**: Choose between full response or summary mode
- **Voice Controls**: Mute/unmute, voice selection, speed, pitch, and volume controls

### Voice Conversation (STT + TTS)
- **Speech-to-Text**: Speak to the chatbot and have your speech converted to text
- **Real-time Transcription**: See your speech transcribed in real-time
- **Auto-send**: Automatically send messages when you finish speaking
- **Manual Controls**: Send, clear, and edit transcriptions manually
- **Multi-language Support**: Support for multiple languages and accents
- **Voice Responses**: Assistant responses are spoken back to you

### Smart Text Processing
- Removes code blocks, markdown formatting, and HTML tags
- Reads the full assistant response by default
- Option to read only a summary (first sentence)
- Handles special characters and formatting gracefully
- Limits speech length to prevent overly long readings (max 3000 characters)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Brave
- ✅ Safari (limited support)
- ✅ Other Chromium-based browsers

### Browser Requirements
- Modern browser with Web Speech API support
- Microphone permissions required for voice conversation
- User interaction required (browsers require user action before allowing speech)
- HTTPS required for microphone access in most browsers

## Usage

### Text-to-Speech (TTS)
1. **Basic Usage**: Assistant responses are automatically read aloud
2. **Mute/Unmute**: Click the volume icon in the header
3. **Advanced Settings**: Click the settings icon next to volume for voice selection and controls
4. **Full Response Toggle**: Choose whether to read complete responses or summaries

### Voice Conversation
1. **Start Voice Chat**: Click the microphone icon in the header
2. **Speak**: Click "Start" and speak your message
3. **Auto-send**: Messages are automatically sent when you finish speaking
4. **Manual Control**: Use "Send" and "Clear" buttons for manual control
5. **Settings**: Configure language, auto-send, and voice response settings

## Voice Conversation Features

### Speech Recognition
- **Real-time Transcription**: See your speech as you speak
- **Language Selection**: Choose from multiple supported languages
- **Error Handling**: Clear error messages for unsupported browsers
- **Continuous Recognition**: Speak naturally with pauses

### Voice Response
- **Automatic Speech**: Assistant responses are spoken back
- **Voice Selection**: Choose from available system voices
- **Speed Control**: Adjust speech rate for better comprehension
- **Mute Option**: Turn off voice responses if needed

### Settings & Controls
- **Language Selection**: Choose your speaking language
- **Auto-send Toggle**: Automatically send when speech ends
- **Auto-speak Toggle**: Automatically speak assistant responses
- **Voice Selection**: Choose assistant response voice
- **Speech Speed**: Adjust how fast the assistant speaks

## Troubleshooting

### Speech Recognition Issues
**Microphone not working?**
- Ensure you're using a supported browser (Chrome recommended)
- Check microphone permissions in browser settings
- Try refreshing the page and granting permissions again
- Some browsers require HTTPS for microphone access

**Speech not being recognized?**
- Speak clearly and at a normal pace
- Check that the correct language is selected
- Ensure microphone is not muted in system settings
- Try using a different microphone or headset

### Text-to-Speech Issues
**Speech not working?**
- Ensure you're using a supported browser (Chrome recommended)
- Check that the volume is not muted
- Try refreshing the page and interacting with the chat first
- Some browsers require user interaction before allowing speech

**No voices available?**
- Wait a moment for voices to load
- Try refreshing the page
- Check browser console for any errors

**Speech stops unexpectedly?**
- This may be due to browser limitations or system audio issues
- Try adjusting the speech rate or volume
- Check if other applications are using audio

## Technical Details

### Implementation
- **TTS**: Uses `SpeechSynthesisUtterance` for speech synthesis
- **STT**: Uses `SpeechRecognition` for speech recognition
- **Voice Management**: Implements voice loading and selection with fallback to English voices
- **Browser Compatibility**: Includes Chrome-specific fixes for known speech synthesis bugs
- **Text Processing**: Cleans markdown, code blocks, and formatting for natural speech

### Performance
- **Asynchronous Processing**: Speech is processed without blocking the UI
- **Resource Management**: Automatic cleanup of speech resources
- **Error Handling**: Comprehensive error handling for unsupported features
- **Memory Efficient**: Proper cleanup of speech recognition and synthesis

### Accessibility
- **Visual Feedback**: Clear indicators for listening and speaking states
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Compatible**: Works with assistive technologies
- **User Preferences**: Respects user preferences for speech and audio

## Files Added/Modified

### New Files
- `src/hooks/useSpeechToText.ts` - Speech recognition hook
- `src/components/chat/VoiceConversation.tsx` - Voice conversation UI
- `TTS_FEATURE.md` - This documentation

### Modified Files
- `src/pages/Chat.tsx` - Integrated voice conversation functionality
- `src/components/ChatLayout.tsx` - Added voice conversation button to header
- `src/hooks/useTextToSpeech.ts` - Enhanced TTS functionality
- `src/lib/speechUtils.ts` - Improved text processing for speech

## Future Enhancements

Potential improvements for future versions:
- **Voice Activity Detection**: Automatic start/stop based on voice activity
- **Noise Cancellation**: Better handling of background noise
- **Voice Training**: Custom voice training for better recognition
- **Multi-language Conversation**: Seamless language switching
- **Voice Commands**: Special voice commands for app control
- **Offline Support**: Local speech processing for privacy
- **Voice Cloning**: Custom voice synthesis for assistant responses 