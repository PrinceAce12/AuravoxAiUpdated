// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit how often a function can be called
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// RequestAnimationFrame wrapper for smooth animations
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let ticking = false;
  
  return (...args: Parameters<T>) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Intersection Observer wrapper for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Memory-efficient event listener with passive option
export function addPassiveEventListener(
  element: EventTarget,
  event: string,
  handler: EventListener,
  options: AddEventListenerOptions = {}
): () => void {
  const opts: AddEventListenerOptions = {
    passive: true,
    ...options,
  };
  
  element.addEventListener(event, handler, opts);
  
  return () => {
    element.removeEventListener(event, handler, opts);
  };
}

// Batch DOM updates for better performance
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // Use requestIdleCallback if available
    requestIdleCallback(() => {
      updates.forEach(update => update());
    });
  } else {
    // Fallback to requestAnimationFrame
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }
}

// Memoization utility for expensive computations
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, unknown>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Cleanup utility for performance monitoring
export function measurePerformance<T extends (...args: unknown[]) => unknown>(
  name: string,
  func: T
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start}ms`);
    return result;
  }) as T;
} 