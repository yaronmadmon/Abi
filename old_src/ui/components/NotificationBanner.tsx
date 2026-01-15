/**
 * Notification Banner Component
 * Informational notifications only (no urgency)
 */

import { TaskNotification } from '@/types/tasks';
import './NotificationBanner.css';

interface NotificationBannerProps {
  notification: TaskNotification;
  onDismiss?: (notification: TaskNotification) => void;
  onRead?: (notification: TaskNotification) => void;
}

export function NotificationBanner({
  notification,
  onDismiss,
  onRead,
}: NotificationBannerProps) {
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(notification);
    }
  };

  const handleClick = () => {
    if (onRead && !notification.read) {
      onRead(notification);
    }
  };

  return (
    <div
      className={`notification-banner ${notification.read ? 'notification-banner--read' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="notification-banner__content">
        <p className="notification-banner__message">{notification.message}</p>
        <span className="notification-banner__time">
          {formatNotificationTime(notification.timestamp)}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="notification-banner__dismiss"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
}

function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMinutes / 1440);
  return `${days}d ago`;
}
