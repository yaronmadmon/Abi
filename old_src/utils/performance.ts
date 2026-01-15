/**
 * Performance Utilities
 * Optimize rendering and operations for lifetime readiness
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function results
 */
export function memoize<Args extends any[], Return>(
  func: (...args: Args) => Return,
  keyGenerator?: (...args: Args) => string
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return function memoizedFunction(...args: Args): Return {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Batch updates for React state
 */
export function batchUpdates<T>(
  updates: (() => T)[],
  setState: (updater: (prev: T) => T) => void
): void {
  // React 18+ batches automatically, but this provides explicit batching
  // In React 18, multiple setState calls are automatically batched
  updates.forEach(update => {
    setState(prev => update());
  });
}

/**
 * Lazy load component
 */
export function lazyLoad<T>(
  loader: () => Promise<{ default: T }>
): () => Promise<T> {
  let loaded: T | null = null;
  let loading: Promise<T> | null = null;

  return async () => {
    if (loaded) {
      return loaded;
    }

    if (!loading) {
      loading = loader().then(module => {
        loaded = module.default;
        return loaded;
      });
    }

    return loading;
  };
}
