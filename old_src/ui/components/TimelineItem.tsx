/**
 * Timeline Item Component
 * Displays a single timeline item (Task, Event, Note, Document)
 */

import { TimelineItem as TimelineItemType } from '@/types/timeline';
import './TimelineItem.css';

interface TimelineItemProps {
  item: TimelineItemType;
  showLinks?: boolean;
  onItemClick?: (item: TimelineItemType) => void;
}

export function TimelineItem({ item, showLinks = false, onItemClick }: TimelineItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'task':
        return '✓';
      case 'event':
        return '📅';
      case 'note':
        return '📝';
      case 'document':
        return '📄';
      default:
        return '•';
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'task':
        return 'Task';
      case 'event':
        return 'Event';
      case 'note':
        return 'Note';
      case 'document':
        return 'Document';
      default:
        return item.type;
    }
  };

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div 
      className={`timeline-item timeline-item--${item.type}`}
      onClick={handleClick}
      role={onItemClick ? 'button' : undefined}
      tabIndex={onItemClick ? 0 : undefined}
    >
      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <span className="timeline-item__icon" aria-hidden="true">
            {getIcon()}
          </span>
          <span className="timeline-item__type">{getTypeLabel()}</span>
          <span className="timeline-item__date">{item.displayDate}</span>
        </div>
        
        <h3 className="timeline-item__title">{item.title}</h3>
        
        {item.description && (
          <p className="timeline-item__description">{item.description}</p>
        )}
        
        {showLinks && item.linkedItems && item.linkedItems.length > 0 && (
          <div className="timeline-item__links">
            <span className="timeline-item__links-label">
              Related ({item.linkedItems.length})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
