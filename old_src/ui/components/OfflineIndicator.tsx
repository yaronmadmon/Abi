/**
 * Offline Indicator Component
 * Show offline status and queued actions
 */

import { useState, useEffect } from 'react';
import { getOfflineStatus } from '@/utils/offline';
import './OfflineIndicator.css';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [status, setStatus] = useState(getOfflineStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getOfflineStatus());
    };

    // Update on online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Periodic check
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  // Only show if there's something to communicate (offline or pending actions)
  if (status.online && !status.hasPendingActions) {
    return null;
  }

  return (
    <div className={`offline-indicator ${className} ${!status.online ? 'offline-indicator--offline' : ''}`}>
      {!status.online ? (
        <span className="offline-indicator__message">
          Handled offline — syncing when ready
        </span>
      ) : status.hasPendingActions ? (
        <span className="offline-indicator__message">
          Syncing when ready
        </span>
      ) : null}
    </div>
  );
}
