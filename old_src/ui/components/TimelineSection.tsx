/**
 * Timeline Section Component
 * Groups timeline items by period (past, present, upcoming)
 */

import { TimelineSection as TimelineSectionType } from '@/types/timeline';
import { TimelineItem } from './TimelineItem';
import './TimelineSection.css';

interface TimelineSectionProps {
  section: TimelineSectionType;
  onItemClick?: (item: TimelineItemType) => void;
}

type TimelineItemType = import('@/types/timeline').TimelineItem;

export function TimelineSection({ section, onItemClick }: TimelineSectionProps) {
  if (section.items.length === 0) {
    return null;
  }

  return (
    <div className={`timeline-section timeline-section--${section.period}`}>
      <h2 className="timeline-section__label">{section.label}</h2>
      <div className="timeline-section__items">
        {section.items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            showLinks={true}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
