/**
 * Daily Card Component
 * Displays a single task, event, or reminder
 */

import { TodayItem } from '@/types/today';
import './DailyCard.css';

interface DailyCardProps {
  item: TodayItem;
}

export function DailyCard({ item }: DailyCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'task':
        return '✓';
      case 'event':
        return '📅';
      case 'reminder':
        return '🔔';
      default:
        return '•';
    }
  };

  const getPriorityClass = () => {
    if (!item.priority) return '';
    return `daily-card--priority-${item.priority}`;
  };

  return (
    <div className={`daily-card ${getPriorityClass()}`}>
      <div className="daily-card__icon" aria-hidden="true">
        {getIcon()}
      </div>
      <div className="daily-card__content">
        <h3 className="daily-card__title">{item.title}</h3>
        {item.description && (
          <p className="daily-card__description">{item.description}</p>
        )}
        {item.time && (
          <span className="daily-card__time">{item.time}</span>
        )}
      </div>
    </div>
  );
}
