import cors from 'cors';

// CORS middleware
const corsMiddleware = cors({
  origin: true,
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({ 
    status: 'ok', 
    message: 'Speech-to-text server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
} 