import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Store audio files temporarily
const audioDir = path.join(__dirname, 'temp-audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

// Free speech-to-text using a simple approach
// For now, we'll use a mock transcription that can be replaced with a real free service
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Save the audio file temporarily
    const audioPath = path.join(audioDir, `audio-${Date.now()}.webm`);
    fs.writeFileSync(audioPath, req.file.buffer);

    // For now, return a mock transcript
    // In a real implementation, you would:
    // 1. Use a free speech-to-text service like:
    //    - Azure Speech Services (free tier: 5 hours/month)
    //    - Google Cloud Speech-to-Text (free tier: 60 minutes/month)
    //    - AWS Transcribe (free tier: 60 minutes/month)
    //    - Or use a local solution like Vosk, Whisper, etc.
    
    // Mock transcript for demonstration
    const mockTranscripts = [
      "Hello, how are you today?",
      "This is a test message from voice recognition",
      "The weather is nice today",
      "I would like to send a message",
      "Voice recognition is working properly",
      "Thank you for using our service",
      "This is a demonstration of voice input",
      "The system is functioning correctly"
    ];
    
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    // Clean up the temporary file
    fs.unlinkSync(audioPath);

    res.json({ 
      transcript: randomTranscript,
      success: true,
      message: "Audio received and processed successfully"
    });

  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ 
      error: 'Transcription failed',
      details: err.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Speech-to-text server is running',
    timestamp: new Date().toISOString()
  });
});

// Clean up temp files on server shutdown
process.on('SIGINT', () => {
  console.log('Cleaning up temporary files...');
  if (fs.existsSync(audioDir)) {
    fs.readdirSync(audioDir).forEach(file => {
      fs.unlinkSync(path.join(audioDir, file));
    });
    fs.rmdirSync(audioDir);
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Free Speech-to-Text server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🎤 Transcribe endpoint: http://localhost:${port}/api/transcribe`);
  console.log(`💡 This is a mock implementation. Replace with real speech-to-text service.`);
});

export default app; 