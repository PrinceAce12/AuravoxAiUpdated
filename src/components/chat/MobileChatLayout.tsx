import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { ChatInput, ChatInputRef } from './ChatInput';
import './MobileChatLayout.css';

interface MobileChatLayoutProps {
  children: ReactNode;
  header: ReactNode;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  user?: any;
  onShowAuthModal?: () => void;
  isLoading?: boolean;
}

interface ViewportState {
  height: number;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export const MobileChatLayout: React.FC<MobileChatLayoutProps> = ({
  children,
  header,
  onSendMessage,
  disabled,
  user,
  onShowAuthModal,
  isLoading
}) => {
  const [viewportState, setViewportState] = useState<ViewportState>({
    height: 0,
    isKeyboardVisible: false,
    keyboardHeight: 0
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const chatInputRef = useRef<ChatInputRef>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  
  // Track initial viewport height
  const initialViewportHeight = useRef<number>(0);
  const lastViewportHeight = useRef<number>(0);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768) || 
                    ('ontouchstart' in window);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize viewport tracking
  useEffect(() => {
    if (!isMobile) return;

    const updateViewportState = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const currentWidth = window.visualViewport?.width || window.innerWidth;
      
      // Store initial height on first load
      if (initialViewportHeight.current === 0) {
        initialViewportHeight.current = currentHeight;
        lastViewportHeight.current = currentHeight;
      }

      const heightDifference = initialViewportHeight.current - currentHeight;
      const isKeyboardVisible = heightDifference > 150; // Threshold for keyboard detection
      const keyboardHeight = isKeyboardVisible ? heightDifference : 0;

      setViewportState({
        height: currentHeight,
        isKeyboardVisible,
        keyboardHeight
      });

      lastViewportHeight.current = currentHeight;
    };

    // Initial setup
    updateViewportState();

    // Use visualViewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportState);
      return () => {
        window.visualViewport?.removeEventListener('resize', updateViewportState);
      };
    } else {
      // Fallback for older browsers
      const handleResize = () => {
        // Debounce resize events
        clearTimeout((window as any).resizeTimeout);
        (window as any).resizeTimeout = setTimeout(updateViewportState, 100);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', () => {
        // Reset initial height on orientation change
        setTimeout(() => {
          initialViewportHeight.current = window.innerHeight;
          updateViewportState();
        }, 300);
      });

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }
  }, [isMobile]);

  // Calculate dynamic heights
  const headerHeight = headerRef.current?.offsetHeight || 0;
  const inputHeight = inputContainerRef.current?.offsetHeight || 0;
  
  // Calculate message area height dynamically
  const messageAreaHeight = viewportState.height - headerHeight - inputHeight;

  // Focus management for mobile
  const handleInputFocus = useCallback(() => {
    // Ensure smooth scrolling to input on focus
    setTimeout(() => {
      inputContainerRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }, 100);
  }, []);

  // Handle input blur to potentially hide keyboard
  const handleInputBlur = useCallback(() => {
    // Optional: Add any cleanup when input loses focus
  }, []);

  // Auto-scroll to bottom when keyboard appears
  useEffect(() => {
    if (viewportState.isKeyboardVisible && messageAreaRef.current) {
      setTimeout(() => {
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 300);
    }
  }, [viewportState.isKeyboardVisible]);

  // CSS Variables for dynamic styling
  const cssVariables = {
    '--viewport-height': `${viewportState.height}px`,
    '--header-height': `${headerHeight}px`,
    '--input-height': `${inputHeight}px`,
    '--message-area-height': `${messageAreaHeight}px`,
    '--keyboard-height': `${viewportState.keyboardHeight}px`,
    '--is-keyboard-visible': viewportState.isKeyboardVisible ? '1' : '0'
  } as React.CSSProperties;

  return (
    <div 
      className="mobile-chat-layout"
      style={cssVariables}
    >
      {/* Fixed Header */}
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        style={{ height: 'var(--header-height)' }}
      >
        {header}
      </header>

      {/* Message Area - Dynamic Height */}
      <main 
        ref={messageAreaRef}
        className="overflow-y-auto overflow-x-hidden"
        style={{ 
          height: 'var(--message-area-height)',
          marginTop: 'var(--header-height)',
          paddingBottom: viewportState.isKeyboardVisible ? 'var(--keyboard-height)' : '0'
        }}
      >
        <div className="px-3 sm:px-4 py-2">
          {children}
        </div>
      </main>

      {/* Fixed Input Container */}
      <div 
        ref={inputContainerRef}
        className="input-container fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"
        style={{
          transform: viewportState.isKeyboardVisible 
            ? `translateY(-${viewportState.keyboardHeight}px)` 
            : 'translateY(0)'
        }}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <ChatInput
            ref={chatInputRef}
            onSendMessage={onSendMessage}
            disabled={disabled}
            user={user}
            onShowAuthModal={onShowAuthModal}
            isLoading={isLoading}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 left-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
          <div>Height: {viewportState.height}px</div>
          <div>Keyboard: {viewportState.isKeyboardVisible ? 'Yes' : 'No'}</div>
          <div>Keyboard Height: {viewportState.keyboardHeight}px</div>
        </div>
      )}
    </div>
  );
};

export default MobileChatLayout; 