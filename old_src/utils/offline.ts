/**
 * Offline Resilience Utilities
 * Handle offline scenarios gracefully
 */

/**
 * Check if app is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Queue actions for when online
 */
export interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  timestamp: string;
  retries: number;
  status: 'queued' | 'processing' | 'syncing' | 'completed' | 'failed';
  description?: string; // Human-readable description for calm indicator
}

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private maxRetries = 3;
  private processing = false;

  /**
   * Add action to queue
   */
  add(action: () => Promise<void>, description?: string): string {
    const queuedAction: QueuedAction = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'queued',
      description,
    };

    this.queue.push(queuedAction);

    // Try to process if online
    if (isOnline() && !this.processing) {
      this.processQueue();
    }

    return queuedAction.id;
  }

  /**
   * Process queued actions
   */
  async processQueue(): Promise<void> {
    if (this.processing || !isOnline() || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0 && isOnline()) {
        const action = this.queue[0];
        action.status = 'processing';

        try {
          await action.action();
          // Success - mark as completed and remove from queue
          action.status = 'completed';
          this.queue.shift();
        } catch (error) {
          // Error - increment retries
          action.retries += 1;
          action.status = 'syncing'; // Will retry

          if (action.retries >= this.maxRetries) {
            // Max retries reached - mark as failed and remove from queue
            action.status = 'failed';
            console.error(`Action ${action.id} failed after ${this.maxRetries} retries`, error);
            this.queue.shift();
          } else {
            // Retry later - move to end of queue
            this.queue.shift();
            this.queue.push(action);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { 
    queued: number; 
    processing: boolean;
    syncing: number; // Actions currently syncing
    queuedActions: QueuedAction[]; // Actions waiting to sync
  } {
    const queuedActions = this.queue.filter(a => a.status === 'queued' || a.status === 'syncing');
    const syncingCount = this.queue.filter(a => a.status === 'processing' || a.status === 'syncing').length;
    
    return {
      queued: queuedActions.length,
      processing: this.processing,
      syncing: syncingCount,
      queuedActions: queuedActions,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }
}

// Global offline queue instance
export const offlineQueue = new OfflineQueue();

/**
 * Handle online/offline events
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.processQueue();
  });

  window.addEventListener('offline', () => {
    console.log('App is now offline. Actions will be queued.');
  });
}

/**
 * Execute action with offline resilience
 */
export async function executeWithOfflineResilience<T>(
  action: () => Promise<T>,
  onOffline?: () => T
): Promise<T> {
  if (isOnline()) {
    try {
      return await action();
    } catch (error) {
      // If action fails and we're offline, queue it
      if (!isOnline()) {
        if (onOffline) {
          return onOffline();
        }
        throw error;
      }
      throw error;
    }
  } else {
    // Queue for later
    if (onOffline) {
      return onOffline();
    }
    
    // Queue the action
    return new Promise((resolve, reject) => {
      offlineQueue.add(async () => {
        try {
          const result = await action();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

/**
 * Get offline status message
 */
export function getOfflineStatus(): { 
  online: boolean; 
  queued: number;
  syncing: number;
  hasPendingActions: boolean;
} {
  const status = offlineQueue.getStatus();
  return {
    online: isOnline(),
    queued: status.queued,
    syncing: status.syncing,
    hasPendingActions: status.queued > 0 || status.syncing > 0,
  };
}
