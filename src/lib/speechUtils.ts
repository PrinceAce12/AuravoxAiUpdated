/**
 * Cleans text for speech synthesis by removing markdown formatting,
 * code blocks, and other elements that shouldn't be spoken aloud.
 */
export const cleanTextForSpeech = (text: string): string => {
  let cleaned = text;

  // Remove code blocks (```lang\ncode```) but add a note
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' [code block] ');
  
  // Remove inline code (`code`) but keep the content
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links [text](url) - keep only the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Remove markdown headers but add spacing
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, ' ');
  
  // Remove bold and italic markers
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  
  // Remove blockquotes but keep content
  cleaned = cleaned.replace(/^>\s+/gm, '');
  
  // Remove list markers but keep content
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  
  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  
  // Clean up extra whitespace and normalize
  cleaned = cleaned
    .replace(/\n\s*\n/g, '. ') // Replace paragraph breaks with periods
    .replace(/\n/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Remove special characters that might cause speech issues
  cleaned = cleaned.replace(/[^\w\s.,!?;:()\-'"]/g, '');
  
  // Ensure proper sentence endings
  cleaned = cleaned.replace(/\s+\./g, '.');
  cleaned = cleaned.replace(/\.+/g, '.');
  
  return cleaned;
};

/**
 * Checks if the text contains significant content worth speaking
 */
export const shouldSpeakText = (text: string): boolean => {
  const cleaned = cleanTextForSpeech(text);
  return cleaned.length > 10; // Only speak if there's meaningful content
};

/**
 * Extracts text for speech, with smart processing
 */
export const extractSpeechText = (text: string, readFullResponse: boolean = true): string => {
  const cleaned = cleanTextForSpeech(text);
  
  // If the cleaned text is empty or too short, return the original cleaned text
  if (!cleaned.trim() || cleaned.trim().length < 10) {
    return cleaned.trim();
  }
  
  if (!readFullResponse) {
    // Return only the first sentence or paragraph for summary mode
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 300) {
        return firstSentence.substring(0, 300) + '...';
      }
      return firstSentence;
    }
    
    // If no clear sentences, return first 200 characters
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  }
  
  // Full response mode - return the full cleaned text, but with some reasonable limits
  // to prevent extremely long speech (max 3000 characters)
  const maxLength = 3000;
  if (cleaned.length > maxLength) {
    // Try to break at a sentence boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSentenceEnd = truncated.lastIndexOf('.');
    const lastQuestionEnd = truncated.lastIndexOf('?');
    const lastExclamationEnd = truncated.lastIndexOf('!');
    
    const lastBreak = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd);
    
    if (lastBreak > maxLength * 0.7) { // If we found a good break point
      return truncated.substring(0, lastBreak + 1);
    } else {
      return truncated + '...';
    }
  }
  
  return cleaned;
}; 