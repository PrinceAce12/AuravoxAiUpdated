# Voice Search Troubleshooting Guide

## 🚨 **Voice Search Not Working? Here's How to Fix It**

### 🔍 **Step 1: Test Voice Recognition**

1. **Visit the test page**: Go to `/voice-test` in your browser
2. **Click "Check Browser Support"** to see what's available
3. **Try the voice test** to see if it works

### 🌐 **Step 2: Browser Requirements**

#### **✅ Supported Browsers (Best Experience)**
- **Chrome** (all versions) - ✅ Full support
- **Edge** (all versions) - ✅ Full support
- **Firefox** (with HTTPS) - ✅ Full support
- **Safari** (with HTTPS) - ✅ Full support

#### **⚠️ Limited Support**
- **Internet Explorer** - ❌ No voice support (manual fallback)
- **Older browsers** - ❌ Limited support (manual fallback)

### 🔒 **Step 3: HTTPS Requirement**

**Voice recognition requires HTTPS in most browsers:**

```bash
# Check if you're using HTTPS
# URL should start with: https://
# Not: http://
```

**If you're on HTTP:**
- Voice recognition will show fallback modal
- You can still type messages manually
- Consider using HTTPS for full voice support

### 🎤 **Step 4: Microphone Permissions**

**Allow microphone access when prompted:**

1. **Click the microphone button**
2. **Browser will ask for microphone permission**
3. **Click "Allow" or "Yes"**
4. **Try speaking clearly**

**If permission was denied:**
- Click the microphone icon in your browser's address bar
- Select "Allow" for microphone access
- Refresh the page and try again

### 🛠️ **Step 5: Common Issues & Solutions**

#### **Issue: "Voice recognition is not supported"**
**Solution:**
- Try Chrome, Edge, or Firefox
- Make sure you're using HTTPS
- Update your browser to the latest version

#### **Issue: "Microphone access denied"**
**Solution:**
- Click the microphone icon in browser address bar
- Select "Allow" for microphone access
- Refresh the page

#### **Issue: "No speech detected"**
**Solution:**
- Speak more clearly and loudly
- Reduce background noise
- Make sure microphone is working
- Try speaking closer to the microphone

#### **Issue: "Network error"**
**Solution:**
- Check your internet connection
- Try refreshing the page
- Check if the site is accessible

#### **Issue: "Audio capture failed"**
**Solution:**
- Check if microphone is connected
- Try a different microphone
- Check system microphone settings
- Restart browser

### 🔧 **Step 6: Debug Information**

**Check the debug info on `/voice-test` page:**

```
🌐 Browser Support Check:
- SpeechRecognition: ✅ Available / ❌ Not Available
- HTTPS: ✅ Yes / ❌ No
- Microphone: ✅ Available / ❌ Not Available
- User Agent: [your browser info]
- Protocol: https: / http:
- Host: [your domain]
```

### 📱 **Step 7: Mobile Devices**

#### **iOS (iPhone/iPad):**
- **Safari**: Limited but functional
- **Chrome**: May have restrictions
- **Other browsers**: Manual fallback

#### **Android:**
- **Chrome**: Full support
- **Firefox**: Partial support
- **Other browsers**: Manual fallback

### 🎯 **Step 8: Quick Fixes**

#### **For Chrome/Edge:**
1. Go to `chrome://settings/content/microphone`
2. Allow microphone access for your site
3. Refresh the page

#### **For Firefox:**
1. Go to `about:preferences#privacy`
2. Scroll to "Permissions" section
3. Click "Settings" next to "Microphone"
4. Allow access for your site

#### **For Safari:**
1. Go to Safari Preferences > Websites > Microphone
2. Allow access for your site
3. Refresh the page

### 🚀 **Step 9: Alternative Solutions**

#### **If voice doesn't work:**
1. **Use manual typing** - the input field still works
2. **Try a different browser** - Chrome/Edge work best
3. **Use mobile device** - often has better microphone access
4. **Check system settings** - ensure microphone is enabled

#### **For developers:**
1. **Check console errors** - press F12 to open developer tools
2. **Test on HTTPS** - voice recognition requires secure context
3. **Verify microphone** - test in system settings first
4. **Check browser compatibility** - use modern browsers

### 📞 **Step 10: Still Having Issues?**

**If voice search still doesn't work:**

1. **Try the test page**: `/voice-test`
2. **Check browser console** for errors (F12)
3. **Verify microphone** in system settings
4. **Try a different browser** (Chrome recommended)
5. **Ensure HTTPS** is being used
6. **Check internet connection**

### 🎉 **Success Indicators**

**Voice search is working when you see:**
- ✅ Microphone button turns red when clicked
- ✅ "Listening..." indicator appears
- ✅ Real-time transcription shows as you speak
- ✅ Toast notifications appear
- ✅ Final transcript appears in input field

### 📋 **Checklist**

- [ ] Using supported browser (Chrome/Edge/Firefox/Safari)
- [ ] HTTPS connection (not HTTP)
- [ ] Microphone permissions allowed
- [ ] Microphone hardware working
- [ ] Speaking clearly and loudly
- [ ] No background noise
- [ ] Browser is up to date
- [ ] Internet connection stable

### 🔗 **Test URLs**

- **Voice Test Page**: `/voice-test`
- **Main Chat**: `/chat`
- **Browser Test**: Visit any site and try voice input

---

## 🆘 **Need More Help?**

If you're still experiencing issues:

1. **Check the test page** at `/voice-test` for detailed debug info
2. **Try a different browser** (Chrome works best)
3. **Ensure HTTPS** is being used
4. **Allow microphone permissions** when prompted
5. **Test microphone** in system settings first

**Remember**: Voice search is a convenience feature. You can always type your messages manually if voice doesn't work! 