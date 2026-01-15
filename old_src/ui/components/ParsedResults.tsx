/**
 * Parsed Results Component
 * Shows parsed items for user confirmation
 */

import { ParsedItem } from '@/types/today';
import './ParsedResults.css';

interface ParsedResultsProps {
  items: ParsedItem[];
  onConfirm: (items: ParsedItem[]) => void;
  onCancel: () => void;
}

export function ParsedResults({ items, onConfirm, onCancel }: ParsedResultsProps) {
  if (items.length === 0) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'event':
        return 'Event';
      case 'note':
        return 'Note';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'event':
        return '📅';
      case 'note':
        return '📝';
      default:
        return '•';
    }
  };

  return (
    <div className="parsed-results">
      <div className="parsed-results__header">
        <h3 className="parsed-results__title">
          Found {items.length} item{items.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={onCancel}
          className="parsed-results__close"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      <div className="parsed-results__list">
        {items.map((item) => (
          <div key={item.id} className="parsed-result-item">
            <div className="parsed-result-item__icon" aria-hidden="true">
              {getTypeIcon(item.type)}
            </div>
            <div className="parsed-result-item__content">
              <div className="parsed-result-item__header">
                <span className="parsed-result-item__type">
                  {getTypeLabel(item.type)}
                </span>
                {item.priority && (
                  <span className={`parsed-result-item__priority parsed-result-item__priority--${item.priority}`}>
                    {item.priority}
                  </span>
                )}
              </div>
              <div className="parsed-result-item__title">{item.title}</div>
              {item.description && (
                <div className="parsed-result-item__description">
                  {item.description}
                </div>
              )}
              {(item.dueDate || item.startTime) && (
                <div className="parsed-result-item__meta">
                  {item.startTime && <span>{item.startTime}</span>}
                  {item.dueDate && <span>{item.dueDate}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="parsed-results__actions">
        <button
          onClick={onCancel}
          className="parsed-results__button parsed-results__button--cancel"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(items)}
          className="parsed-results__button parsed-results__button--confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
