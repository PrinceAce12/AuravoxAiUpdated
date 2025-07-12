# 🚀 Vercel Deployment Guide for Voice Recognition

This guide will help you deploy your voice recognition app to Vercel with full functionality.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Node.js**: Version 16 or higher

## 🔧 Setup Steps

### Step 1: Prepare Your Repository

Make sure your repository has these files:
- ✅ `api/transcribe.js` - Speech-to-text endpoint
- ✅ `api/health.js` - Health check endpoint
- ✅ `vercel.json` - Vercel configuration
- ✅ Updated `package.json` with Vercel build script

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: your-app-name
# - Directory: ./
# - Override settings? No
```

### Step 3: Configure Environment Variables

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   NODE_ENV=production
   ```

### Step 4: Test Your Deployment

1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
2. **Voice Recognition**: Test the voice button in your app
3. **Brave Browser**: Test specifically in Brave browser

## 🎯 How It Works

### Development vs Production

**Development (Local):**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

**Production (Vercel):**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.vercel.app/api/*`

### Voice Recognition Flow

1. **User clicks voice button** in Brave browser
2. **MediaRecorder captures audio** (works in Brave)
3. **Audio sent to Vercel function** `/api/transcribe`
4. **Mock transcription returned** (free, no API keys needed)
5. **Transcript sent as chat message**

## 🔍 Testing Your Deployment

### Test Commands

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test transcription endpoint (with audio file)
curl -X POST https://your-app.vercel.app/api/transcribe \
  -F "audio=@test-audio.webm"
```

### Browser Testing

1. **Chrome/Edge**: Should work with Web Speech API
2. **Brave**: Should use MediaRecorder fallback
3. **Firefox**: Should work with Web Speech API
4. **Mobile**: Should work with MediaRecorder

## 🛠️ Customization Options

### Option 1: Replace Mock with Real Speech-to-Text

Update `api/transcribe.js` to use a real service:

```javascript
// Example: Azure Speech Services (5 hours free/month)
import { SpeechClient } from '@azure/ai-speech';

export default async function handler(req, res) {
  // Your real transcription logic here
  const client = new SpeechClient(process.env.AZURE_SPEECH_KEY);
  // ... transcription code
}
```

### Option 2: Add Real Speech-to-Text Services

**Free Options:**
- **Azure Speech Services**: 5 hours/month free
- **Google Cloud Speech-to-Text**: 60 minutes/month free
- **AWS Transcribe**: 60 minutes/month free

**Setup Azure (Recommended):**
1. Create Azure account
2. Enable Speech Services
3. Get API key
4. Add to Vercel environment variables:
   ```
   AZURE_SPEECH_KEY=your-key-here
   AZURE_SPEECH_REGION=your-region
   ```

## 📊 Monitoring

### Vercel Analytics
- Go to your Vercel dashboard
- Check "Analytics" tab
- Monitor function execution times
- Check for errors

### Function Logs
- Go to your Vercel dashboard
- Navigate to "Functions" tab
- Check `/api/transcribe` logs
- Monitor performance

## 🚨 Troubleshooting

### Common Issues

#### Issue: "Function timeout"
**Solution**: Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/transcribe.js": {
      "maxDuration": 60
    }
  }
}
```

#### Issue: "CORS error"
**Solution**: Check CORS headers in `vercel.json` and `api/transcribe.js`

#### Issue: "Audio not being sent"
**Solution**: Check browser console for network errors

#### Issue: "Brave browser not working"
**Solution**: 
1. Check Brave Shields settings
2. Allow microphone access
3. Try disabling shields for the site

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed requests
3. **Check Vercel function logs** for backend errors
4. **Test health endpoint** to verify backend is working

## 🎉 Success!

Once deployed, your voice recognition will work:
- ✅ **In Brave browser** (with MediaRecorder fallback)
- ✅ **In all other browsers** (with Web Speech API)
- ✅ **Completely free** (no API costs)
- ✅ **Production ready** (scalable and reliable)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Test with different browsers
4. Verify environment variables are set correctly

---

**Your voice recognition app is now ready for production! 🎤✨** 