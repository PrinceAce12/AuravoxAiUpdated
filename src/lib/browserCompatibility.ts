export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    webSpeechAPI: boolean;
    reactSpeechRecognition: boolean;
    polyfill: boolean;
    https: boolean;
    microphone: boolean;
  };
  recommendations: string[];
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  const isHTTPS = window.location.protocol === 'https:';
  
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let isSupported = false;
  const recommendations: string[] = [];

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    isSupported = true;
  } else if (userAgent.includes('Edg')) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    isSupported = true;
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    isSupported = true;
    if (!isHTTPS) {
      recommendations.push('Firefox requires HTTPS for voice recognition');
    }
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    isSupported = true;
    if (!isHTTPS) {
      recommendations.push('Safari requires HTTPS for voice recognition');
    }
  } else if (userAgent.includes('Opera')) {
    browserName = 'Opera';
    browserVersion = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
    isSupported = true;
  } else {
    recommendations.push('Try using Chrome, Edge, Firefox, or Safari for best voice recognition support');
  }

  // Check features
  const webSpeechAPI = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  const reactSpeechRecognition = true; // We have the library installed
  const polyfill = !!(window as any).SpeechRecognitionPolyfill;
  const microphone = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  if (!webSpeechAPI && !polyfill) {
    recommendations.push('Voice recognition APIs not available in this browser');
  }

  if (!microphone) {
    recommendations.push('Microphone access not available');
  }

  if (!isHTTPS) {
    recommendations.push('HTTPS is required for voice recognition in most browsers');
  }

  return {
    name: browserName,
    version: browserVersion,
    isSupported,
    features: {
      webSpeechAPI,
      reactSpeechRecognition,
      polyfill,
      https: isHTTPS,
      microphone
    },
    recommendations
  };
};

export const getBrowserSupportMessage = (browserInfo: BrowserInfo): string => {
  if (browserInfo.isSupported && browserInfo.features.webSpeechAPI) {
    return `Voice recognition is fully supported in ${browserInfo.name} ${browserInfo.version}`;
  }
  
  if (browserInfo.isSupported && (browserInfo.features.polyfill || browserInfo.features.reactSpeechRecognition)) {
    return `Voice recognition is partially supported in ${browserInfo.name} ${browserInfo.version}`;
  }
  
  return `Voice recognition is not supported in ${browserInfo.name} ${browserInfo.version}`;
};

export const getVoiceRecognitionStatus = () => {
  const browserInfo = detectBrowser();
  const hasAnySupport = browserInfo.features.webSpeechAPI || 
                       browserInfo.features.reactSpeechRecognition || 
                       browserInfo.features.polyfill;
  
  return {
    isSupported: hasAnySupport && browserInfo.features.microphone,
    browserInfo,
    message: getBrowserSupportMessage(browserInfo),
    recommendations: browserInfo.recommendations
  };
}; 