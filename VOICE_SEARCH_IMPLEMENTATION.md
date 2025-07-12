# Voice Search Implementation

## Overview

This implementation adds accurate voice search functionality to the main chat input field using the Web Speech API. The feature includes:

- **Voice Recognition Button**: A microphone button next to the send button
- **Real-time Feedback**: Visual indicators when listening
- **Error Handling**: Comprehensive error messages for various scenarios
- **Browser Compatibility**: Support for both standard and webkit SpeechRecognition APIs
- **User Authentication**: Voice input requires user authentication

## Features

### 1. Voice Recognition Hook (`useVoiceRecognition`)

Located in `src/hooks/useVoiceRecognition.ts`, this custom hook provides:

- **Speech Recognition**: Uses Web Speech API for accurate voice-to-text conversion
- **Error Handling**: Comprehensive error messages for different failure scenarios
- **Real-time Feedback**: Provides interim and final transcript results
- **Browser Support**: Works with both `SpeechRecognition` and `webkitSpeechRecognition`

### 2. Enhanced Chat Input Component

The `ChatInput` component now includes:

- **Voice Button**: Toggle button with microphone icons
- **Visual Indicators**: Red microphone icon and "Listening..." text when active
- **Toast Notifications**: User feedback for various states
- **Authentication Check**: Requires user login before voice input

## Technical Implementation

### Web Speech API Integration

```typescript
// Browser compatibility
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Configuration
recognition.continuous = false;        // Single utterance
recognition.interimResults = true;     // Real-time feedback
recognition.lang = 'en-US';           // Language setting
```

### Error Handling

The implementation handles various error scenarios:

- **No Speech**: "No speech detected. Please try again."
- **Audio Capture**: "Audio capture failed. Please check your microphone."
- **Permission Denied**: "Microphone access denied. Please allow microphone access."
- **Network Issues**: "Network error occurred. Please check your connection."
- **Browser Support**: "Speech recognition is not supported in this browser."

### User Experience Features

1. **Visual Feedback**:
   - Red microphone icon when listening
   - Animated "Listening..." indicator
   - Button color changes (gray → red when active)

2. **Toast Notifications**:
   - "Listening... Speak now!" when starting
   - "Voice input captured!" when successful
   - Error messages for failures

3. **Accessibility**:
   - Proper ARIA labels and titles
   - Keyboard navigation support
   - Screen reader compatibility

## Browser Compatibility

### Supported Browsers
- **Chrome**: Full support with `webkitSpeechRecognition`
- **Edge**: Full support with `webkitSpeechRecognition`
- **Safari**: Limited support (may require HTTPS)
- **Firefox**: Limited support (may require HTTPS)

### Requirements
- **HTTPS**: Required for microphone access in most browsers
- **User Permission**: Browser will prompt for microphone access
- **Modern Browser**: Requires Web Speech API support

## Usage

### For Users

1. **Start Voice Input**: Click the microphone button
2. **Speak Clearly**: Speak your message when the indicator appears
3. **Stop Voice Input**: Click the microphone button again or wait for auto-stop
4. **Review & Send**: The transcribed text appears in the input field

### For Developers

The voice recognition hook can be reused in other components:

```typescript
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const { isListening, startListening, stopListening, transcript } = useVoiceRecognition({
  onResult: (text) => console.log('Final transcript:', text),
  onError: (error) => console.error('Error:', error)
});
```

## Security Considerations

1. **HTTPS Required**: Voice recognition requires secure context
2. **User Permission**: Browser handles microphone permissions
3. **Authentication**: Voice input requires user login
4. **Data Privacy**: No voice data is stored, only transcribed text

## Performance Optimizations

1. **Lazy Loading**: Voice recognition only initializes when needed
2. **Memory Management**: Proper cleanup of recognition instances
3. **Error Recovery**: Automatic retry mechanisms for common errors
4. **Resource Efficiency**: Minimal impact on application performance

## Future Enhancements

Potential improvements for future versions:

1. **Multi-language Support**: Support for additional languages
2. **Voice Commands**: Special commands for app navigation
3. **Voice Profiles**: User-specific voice recognition training
4. **Offline Support**: Local speech recognition capabilities
5. **Advanced Filtering**: Noise reduction and audio processing

## Troubleshooting

### Common Issues

1. **"Speech recognition is not supported"**
   - Update to a modern browser
   - Ensure HTTPS is enabled

2. **"Microphone access denied"**
   - Allow microphone permissions in browser settings
   - Check browser security settings

3. **"No speech detected"**
   - Speak more clearly and loudly
   - Check microphone hardware
   - Reduce background noise

4. **"Network error"**
   - Check internet connection
   - Try refreshing the page

### Debug Mode

Enable debug logging by adding to the hook:

```typescript
const debug = true; // Set to true for development
if (debug) {
  console.log('Voice recognition state:', { isListening, transcript, error });
}
```

## Testing

### Manual Testing Checklist

- [ ] Voice button appears in chat input
- [ ] Button changes color when active
- [ ] "Listening..." indicator appears
- [ ] Speech is accurately transcribed
- [ ] Error messages display correctly
- [ ] Toast notifications work
- [ ] Authentication check works
- [ ] Browser compatibility verified

### Automated Testing

Consider adding unit tests for:

- Hook functionality
- Component rendering
- Error handling
- User interactions
- Browser compatibility checks 