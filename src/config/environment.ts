// Environment configuration for production readiness
export const config = {
  // App configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Q0',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
    version: '1.0.0',
  },

  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Feature flags
  features: {
    voiceFeatures: import.meta.env.VITE_ENABLE_VOICE_FEATURES === 'true',
    qrScanner: import.meta.env.VITE_ENABLE_QR_SCANNER === 'true',
    adminFeatures: import.meta.env.VITE_ENABLE_ADMIN_FEATURES === 'true',
    googleAuth: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
  },

  // Development settings
  dev: {
    enabled: import.meta.env.DEV || false,
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  },

  // Analytics
  analytics: {
    id: import.meta.env.VITE_ANALYTICS_ID || '',
  },

  // Error reporting
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
  },
};

// Validation function to ensure required environment variables are set
export const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Initialize environment validation in development
if (import.meta.env.DEV) {
  try {
    validateEnvironment();
  } catch (error) {
    console.warn('Environment validation warning:', error);
  }
}

export default config;
