import multer from 'multer';
import cors from 'cors';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// CORS middleware
const corsMiddleware = cors({
  origin: true, // Allow all origins in development
  credentials: true,
});

// Helper function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // Handle CORS
  await runMiddleware(req, res, corsMiddleware);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload
    await runMiddleware(req, res, upload.single('audio'));

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

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
}

// Configure for larger file uploads
export const config = {
  api: {
    bodyParser: false, // Disable body parser, we'll use multer
    responseLimit: false,
  },
}; 