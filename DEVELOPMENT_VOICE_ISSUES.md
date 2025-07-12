# Development Environment Voice Recognition Issues

## 🚨 **"Network error occurred" in Development**

This error is **common in development environments** and doesn't necessarily mean your voice recognition is broken. Here's how to fix it:

### 🔍 **Why This Happens in Development:**

1. **Localhost Limitations**: Some browsers have issues with voice recognition on localhost
2. **Development Server**: Vite dev server might interfere with voice recognition
3. **Browser Security**: Development environments have different security policies
4. **Network Timeout**: Voice recognition services might timeout in development

### 🛠️ **Quick Fixes for Development:**

#### **Fix 1: Use HTTPS in Development**
```bash
# Add HTTPS to your Vite config
# vite.config.ts
export default defineConfig({
  server: {
    https: true
  }
})
```

#### **Fix 2: Try Different Ports**
```bash
# Sometimes port conflicts cause issues
npm run dev -- --port 3000
# or
npm run dev -- --port 8080
```

#### **Fix 3: Use Chrome/Edge**
- Chrome and Edge handle development voice recognition better
- Firefox and Safari might have issues in development

#### **Fix 4: Check Console for Details**
1. **Open browser console** (F12)
2. **Look for detailed error messages**
3. **Check the debug info** on `/voice-test` page

### 🔧 **Development-Specific Solutions:**

#### **Solution 1: Enhanced Debugging**
The updated voice recognition hook now includes:
- **Detailed console logging** for development
- **Enhanced error messages** with debug info
- **Browser compatibility checks**
- **Network status monitoring**

#### **Solution 2: Test on Production Build**
```bash
# Build and test on production
npm run build
npm run preview
```

#### **Solution 3: Use Different Browser**
- **Chrome**: Best for development voice recognition
- **Edge**: Good alternative
- **Firefox**: May have issues in development
- **Safari**: Limited development support

### 📊 **Development vs Production:**

| Environment | Voice Recognition | HTTPS Required | Notes |
|-------------|-------------------|----------------|-------|
| **Development** | ⚠️ Limited | ❌ No | May have network errors |
| **Production** | ✅ Full | ✅ Yes | Works reliably |

### 🎯 **Development Testing Steps:**

#### **Step 1: Check Browser Console**
1. **Open F12** developer tools
2. **Go to Console tab**
3. **Try voice recognition**
4. **Look for error messages**

#### **Step 2: Use Debug Page**
1. **Visit** `/voice-test`
2. **Click "Check Browser Support"**
3. **Review debug information**
4. **Try voice test**

#### **Step 3: Test Different Scenarios**
```javascript
// Check these in browser console:
console.log('SpeechRecognition:', !!window.SpeechRecognition);
console.log('webkitSpeechRecognition:', !!(window as any).webkitSpeechRecognition);
console.log('Protocol:', window.location.protocol);
console.log('Host:', window.location.host);
```

### 🚀 **Development Workarounds:**

#### **Workaround 1: Manual Testing**
- Use the voice test page to verify functionality
- Test microphone permissions separately
- Check browser compatibility

#### **Workaround 2: Production Testing**
- Deploy to a staging environment
- Test with HTTPS enabled
- Verify in production-like conditions

#### **Workaround 3: Alternative Testing**
- Test voice recognition on other sites first
- Use browser's built-in voice input
- Verify microphone works in system settings

### 🔍 **Common Development Issues:**

#### **Issue: "Network error" in development**
**Causes:**
- Localhost limitations
- Development server interference
- Browser security policies
- Network timeout

**Solutions:**
- Use Chrome/Edge
- Try different ports
- Check console for details
- Test on production build

#### **Issue: "Microphone access denied"**
**Causes:**
- Browser security policies
- Development environment restrictions
- Permission not granted

**Solutions:**
- Allow microphone permissions
- Use HTTPS in development
- Try different browser
- Check browser settings

#### **Issue: "No speech detected"**
**Causes:**
- Microphone not working
- Background noise
- Speaking too quietly
- Development environment issues

**Solutions:**
- Test microphone in system settings
- Speak more clearly and loudly
- Reduce background noise
- Try in production environment

### 📋 **Development Checklist:**

- [ ] Using Chrome or Edge
- [ ] Microphone permissions allowed
- [ ] Console shows no errors
- [ ] Debug page shows support
- [ ] Speaking clearly and loudly
- [ ] No background noise
- [ ] Microphone hardware working
- [ ] Internet connection stable

### 🎉 **Success in Development:**

**Voice recognition works in development when:**
- ✅ Console shows "🎤 Voice recognition started"
- ✅ No network errors in console
- ✅ Microphone button turns red
- ✅ "Listening..." indicator appears
- ✅ Real-time transcription works
- ✅ Final transcript appears

### 📞 **Still Having Issues?**

#### **For Development:**
1. **Check console logs** for detailed error info
2. **Try production build** to isolate development issues
3. **Use Chrome/Edge** for best development support
4. **Test microphone** in system settings first
5. **Allow all permissions** when prompted

#### **For Production:**
1. **Ensure HTTPS** is enabled
2. **Test on live domain** (not localhost)
3. **Check SSL certificate** is valid
4. **Verify microphone permissions**
5. **Use supported browsers**

### 🔗 **Test URLs for Development:**

- **Voice Test**: `http://localhost:8081/voice-test`
- **Main Chat**: `http://localhost:8081/chat`
- **Debug Info**: Check browser console (F12)

---

## 💡 **Pro Tips for Development:**

1. **Always test in Chrome/Edge** for best voice recognition
2. **Check console logs** for detailed error information
3. **Use the debug page** (`/voice-test`) for troubleshooting
4. **Test microphone** in system settings first
5. **Allow all permissions** when prompted
6. **Try production build** if development has issues

**Remember**: Network errors in development are common and don't necessarily mean the feature is broken. Test in production for the most accurate results! 