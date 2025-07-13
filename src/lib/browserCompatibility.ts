// Browser compatibility utilities for Web Speech API

export interface BrowserSupport {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  browserName: string;
  browserVersion: string;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isBrave: boolean;
  isMobile: boolean;
  isSecure: boolean;
  isOnline: boolean;
  networkStatus: 'online' | 'offline' | 'unknown';
}

export const detectBrowser = (): BrowserSupport => {
  const userAgent = navigator.userAgent;
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const isOnline = navigator.onLine;
  
  // Detect browser
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let isChrome = false;
  let isFirefox = false;
  let isSafari = false;
  let isEdge = false;
  let isBrave = false;
  let isMobile = false;

  // Check for mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Detect specific browsers
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    isChrome = true;
    browserName = 'Chrome';
    // Check if it's Brave (Brave has a specific user agent)
    if (userAgent.includes('Brave') || (navigator as any).brave?.isBrave()) {
      isBrave = true;
      browserName = 'Brave';
    }
  } else if (userAgent.includes('Firefox')) {
    isFirefox = true;
    browserName = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    isSafari = true;
    browserName = 'Safari';
  } else if (userAgent.includes('Edg')) {
    isEdge = true;
    browserName = 'Edge';
  }

  // Extract version
  const versionMatch = userAgent.match(/(chrome|firefox|safari|edge)\/(\d+)/i);
  if (versionMatch) {
    browserVersion = versionMatch[2];
  }

  // Check Web Speech API support
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition || (window as any).mozSpeechRecognition || (window as any).msSpeechRecognition;
  const speechRecognition = !!SpeechRecognition;
  const speechSynthesis = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  return {
    speechRecognition,
    speechSynthesis,
    browserName,
    browserVersion,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isBrave,
    isMobile,
    isSecure,
    isOnline,
    networkStatus: isOnline ? 'online' : 'offline',
  };
};

export const getBrowserCompatibilityMessage = (support: BrowserSupport): string => {
  if (!support.isOnline) {
    return 'No internet connection: Speech recognition requires an active internet connection. Please check your network and try again.';
  }

  if (!support.isSecure) {
    return 'Speech recognition requires a secure connection (HTTPS). Please use HTTPS or localhost.';
  }

  if (!support.speechRecognition && !support.speechSynthesis) {
    return `Your browser (${support.browserName} ${support.browserVersion}) doesn't support Web Speech API. Please use Chrome, Edge, or Safari.`;
  }

  if (!support.speechRecognition) {
    return `Speech recognition is not supported in ${support.browserName}. Please use Chrome, Edge, or Safari for voice input.`;
  }

  if (!support.speechSynthesis) {
    return `Text-to-speech is not supported in ${support.browserName}. Please use Chrome, Edge, or Safari for voice output.`;
  }

  return '';
};

export const getBrowserRecommendations = (support: BrowserSupport): string[] => {
  const recommendations: string[] = [];

  if (!support.isOnline) {
    recommendations.push('Check your internet connection');
    recommendations.push('Try refreshing the page');
    recommendations.push('Disable VPN if using one');
  }

  if (!support.isSecure) {
    recommendations.push('Use HTTPS or localhost for speech features');
  }

  if (!support.speechRecognition) {
    recommendations.push('Use Chrome, Edge, or Safari for voice input');
  }

  if (!support.speechSynthesis) {
    recommendations.push('Use Chrome, Edge, or Safari for voice output');
  }

  if (support.isBrave) {
    recommendations.push('Brave may require enabling microphone permissions');
    recommendations.push('Check Brave Shields settings for microphone access');
    recommendations.push('Disable Brave Shields for this site if needed');
  }

  if (support.isFirefox) {
    recommendations.push('Firefox has limited speech synthesis support');
  }

  if (support.isMobile) {
    recommendations.push('Mobile browsers may have limited speech API support');
  }

  // Network-specific recommendations
  if (!support.isOnline) {
    recommendations.push('Speech recognition requires internet connection');
    recommendations.push('Check if your firewall is blocking the connection');
  }

  return recommendations;
};

export const getSupportedBrowsers = (): Array<{ name: string; features: string[] }> => {
  return [
    {
      name: 'Chrome',
      features: ['Speech Recognition', 'Text-to-Speech', 'Full Support']
    },
    {
      name: 'Edge',
      features: ['Speech Recognition', 'Text-to-Speech', 'Full Support']
    },
    {
      name: 'Safari',
      features: ['Speech Recognition', 'Text-to-Speech', 'Full Support']
    },
    {
      name: 'Brave',
      features: ['Speech Recognition', 'Text-to-Speech', 'May need permissions']
    },
    {
      name: 'Firefox',
      features: ['Limited Text-to-Speech', 'No Speech Recognition']
    }
  ];
};

// Check if we're in a development environment
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
};

// Get detailed browser info for debugging
export const getDetailedBrowserInfo = (): string => {
  const support = detectBrowser();
  const compatibilityMessage = getBrowserCompatibilityMessage(support);
  const recommendations = getBrowserRecommendations(support);

  return `
Browser: ${support.browserName} ${support.browserVersion}
Speech Recognition: ${support.speechRecognition ? '✅' : '❌'}
Text-to-Speech: ${support.speechSynthesis ? '✅' : '❌'}
Secure Connection: ${support.isSecure ? '✅' : '❌'}
Network Status: ${support.isOnline ? '✅ Online' : '❌ Offline'}
Mobile: ${support.isMobile ? 'Yes' : 'No'}
Brave: ${support.isBrave ? 'Yes' : 'No'}

Compatibility: ${compatibilityMessage || '✅ Fully Supported'}

Recommendations:
${recommendations.map(rec => `• ${rec}`).join('\n')}
  `.trim();
};

// Network connectivity utilities
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to test connectivity
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

export const getNetworkErrorTroubleshooting = (): string[] => {
  return [
    'Check your internet connection',
    'Try refreshing the page',
    'Disable VPN or proxy if using one',
    'Check if your firewall is blocking the connection',
    'Try a different network (mobile hotspot)',
    'Clear browser cache and cookies',
    'Restart your browser',
    'Check if the speech service is available in your region'
  ];
}; 