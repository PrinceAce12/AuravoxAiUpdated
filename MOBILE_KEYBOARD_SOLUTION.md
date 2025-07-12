# Mobile Keyboard Handling Solution

This solution provides a comprehensive approach to handling mobile keyboard behavior in React chat applications, ensuring the header stays fixed, the message area resizes dynamically, and the input stays positioned above the keyboard.

## 🎯 **Key Features**

- **Fixed Header**: Header remains at the top and unaffected by keyboard
- **Dynamic Message Area**: Automatically resizes to fit remaining viewport space
- **Fixed Input**: Input bar stays positioned above the keyboard
- **Viewport Tracking**: Uses `visualViewport` API with fallback for older browsers
- **TypeScript Support**: Fully typed with proper interfaces
- **Cross-Browser Compatibility**: Works on Chrome (Android) and Safari (iOS)

## 📁 **File Structure**

```
src/components/chat/
├── MobileChatLayout.tsx      # Main mobile layout component
├── MobileChatLayout.css      # Mobile-specific styles
├── MobileChatExample.tsx     # Usage example
└── ChatInput.tsx            # Updated with onFocus/onBlur props
```

## 🔧 **How It Works**

### 1. **Viewport Tracking**

The solution uses the `visualViewport` API to track viewport changes:

```typescript
const updateViewportState = () => {
  const currentHeight = window.visualViewport?.height || window.innerHeight;
  const heightDifference = initialViewportHeight.current - currentHeight;
  const isKeyboardVisible = heightDifference > 150;
  
  setViewportState({
    height: currentHeight,
    isKeyboardVisible,
    keyboardHeight: isKeyboardVisible ? heightDifference : 0
  });
};
```

### 2. **Dynamic Height Calculation**

Heights are calculated dynamically based on viewport changes:

```typescript
const headerHeight = headerRef.current?.offsetHeight || 0;
const inputHeight = inputContainerRef.current?.offsetHeight || 0;
const messageAreaHeight = viewportState.height - headerHeight - inputHeight;
```

### 3. **CSS Variables for Dynamic Styling**

CSS variables are used for responsive layout:

```typescript
const cssVariables = {
  '--viewport-height': `${viewportState.height}px`,
  '--header-height': `${headerHeight}px`,
  '--message-area-height': `${messageAreaHeight}px`,
  '--keyboard-height': `${viewportState.keyboardHeight}px`
} as React.CSSProperties;
```

## 🚀 **Implementation**

### 1. **Basic Usage**

```typescript
import MobileChatLayout from './components/chat/MobileChatLayout';

const MyChatApp = () => {
  const header = (
    <div className="flex items-center justify-between px-4 py-3">
      <h1>Chat App</h1>
      <button>Settings</button>
    </div>
  );

  return (
    <MobileChatLayout
      header={header}
      onSendMessage={handleSendMessage}
      user={user}
      onShowAuthModal={handleAuth}
    >
      <MessageList messages={messages} />
    </MobileChatLayout>
  );
};
```

### 2. **Integration with Existing Chat**

Replace your existing chat layout with `MobileChatLayout`:

```typescript
// Before
<div className="flex flex-col h-screen">
  <header>...</header>
  <main>...</main>
  <ChatInput />
</div>

// After
<MobileChatLayout
  header={<YourHeader />}
  onSendMessage={handleSendMessage}
  user={user}
>
  <YourMessageList />
</MobileChatLayout>
```

## 📱 **Mobile-Specific Features**

### 1. **Safe Area Support**

The CSS includes safe area handling for devices with notches:

```css
@supports (padding: max(0px)) {
  .mobile-chat-layout header {
    padding-top: max(env(safe-area-inset-top), 0px);
  }
  
  .mobile-chat-layout .input-container {
    padding-bottom: max(env(safe-area-inset-bottom), 0px);
  }
}
```

### 2. **Prevent Zoom on Input Focus**

```css
.mobile-chat-layout input,
.mobile-chat-layout textarea {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### 3. **Smooth Scrolling**

```css
.mobile-chat-layout main {
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
  scroll-behavior: smooth;
}
```

## 🔍 **Technical Details**

### **Viewport State Interface**

```typescript
interface ViewportState {
  height: number;           // Current viewport height
  isKeyboardVisible: boolean; // Whether keyboard is visible
  keyboardHeight: number;   // Height of the keyboard
}
```

### **Event Handling**

The component handles several events:

1. **visualViewport.resize**: Modern browsers
2. **window.resize**: Fallback for older browsers
3. **orientationchange**: Handle device rotation

### **Focus Management**

```typescript
const handleInputFocus = useCallback(() => {
  setTimeout(() => {
    inputContainerRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'end' 
    });
  }, 100);
}, []);
```

## 🛠 **Browser Compatibility**

### **Supported Browsers**

- ✅ Chrome (Android) - Full support
- ✅ Safari (iOS) - Full support
- ✅ Firefox (Android) - Full support
- ✅ Edge (Mobile) - Full support

### **Fallback Strategy**

For browsers without `visualViewport` support:

```typescript
if (window.visualViewport) {
  // Modern approach
  window.visualViewport.addEventListener('resize', updateViewportState);
} else {
  // Fallback for older browsers
  window.addEventListener('resize', debouncedUpdateViewportState);
}
```

## 🎨 **Styling Considerations**

### **CSS Variables**

The layout uses CSS variables for dynamic styling:

```css
.mobile-chat-layout {
  --viewport-height: 100vh;
  --header-height: 60px;
  --message-area-height: calc(100vh - 60px - 80px);
  --keyboard-height: 0px;
}
```

### **Responsive Design**

```css
@media (max-width: 640px) {
  .mobile-chat-layout {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
  }
}
```

## 🔧 **Customization**

### **Custom Header**

```typescript
const CustomHeader = () => (
  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
    <h1 className="text-lg font-bold">My Chat App</h1>
    <button className="p-2 rounded-full bg-white/20">
      <Settings className="w-5 h-5" />
    </button>
  </div>
);
```

### **Custom Input Styling**

```css
.mobile-chat-layout .input-container {
  background: linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.8));
  backdrop-filter: blur(20px);
}
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Header moves when keyboard appears**
   - Ensure header has `position: fixed`
   - Check z-index values

2. **Input not positioned correctly**
   - Verify `transform` calculations
   - Check keyboard height detection threshold

3. **Content hidden behind keyboard**
   - Ensure proper padding/margin calculations
   - Check safe area insets

### **Debug Mode**

Enable debug info in development:

```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <div>Height: {viewportState.height}px</div>
    <div>Keyboard: {viewportState.isKeyboardVisible ? 'Yes' : 'No'}</div>
    <div>Keyboard Height: {viewportState.keyboardHeight}px</div>
  </div>
)}
```

## 📈 **Performance Optimizations**

1. **Debounced Updates**: Resize events are debounced to prevent excessive updates
2. **Memoized Calculations**: Height calculations are memoized
3. **Efficient Re-renders**: Only updates when viewport actually changes
4. **CSS Transitions**: Smooth animations for better UX

## 🔮 **Future Enhancements**

- [ ] Support for split-screen mode
- [ ] Better landscape orientation handling
- [ ] Accessibility improvements
- [ ] Performance monitoring
- [ ] Custom keyboard shortcuts

This solution provides a robust, production-ready approach to handling mobile keyboard behavior in React chat applications. 