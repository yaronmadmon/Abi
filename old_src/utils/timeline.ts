/**
 * Timeline Utilities
 * Helper functions for timeline operations
 */

import { TimelineItem, TimelinePeriod, TimelineSection } from '@/types/timeline';
import { Task, Event, Note, Document, TaskStatus } from '@/models';

export function groupItemsByPeriod(items: TimelineItem[]): TimelineSection[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const past: TimelineItem[] = [];
  const present: TimelineItem[] = [];
  const upcoming: TimelineItem[] = [];

  items.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    
    if (itemDate < today) {
      past.push(item);
    } else if (itemDate >= today && itemDate < tomorrow) {
      present.push(item);
    } else {
      upcoming.push(item);
    }
  });

  // Sort items within each period
  past.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  present.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  upcoming.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sections: TimelineSection[] = [];

  if (upcoming.length > 0) {
    sections.push({
      period: TimelinePeriod.UPCOMING,
      label: 'Upcoming',
      items: upcoming,
    });
  }

  if (present.length > 0) {
    sections.push({
      period: TimelinePeriod.PRESENT,
      label: 'Today',
      items: present,
    });
  }

  if (past.length > 0) {
    sections.push({
      period: TimelinePeriod.PAST,
      label: 'Past',
      items: past,
    });
  }

  return sections;
}

export function formatDisplayDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (itemDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Month Day" or "Month Day, Year" if different year
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear() !== now.getFullYear() ? `, ${year}` : '';
  
  return `${month} ${day}${year}`;
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function entityToTimelineItem(entity: Task | Event | Note | Document): TimelineItem {
  let timestamp: string;
  let title: string;
  let description: string | undefined;
  let type: TimelineItemType;

  if ('title' in entity) {
    title = entity.title;
    
    if ('startTime' in entity) {
      // Event
      type = 'event';
      timestamp = entity.startTime;
      description = entity.description;
    } else if ('content' in entity) {
      // Note
      type = 'note';
      timestamp = entity.createdAt;
      description = entity.content;
    } else if ('fileName' in entity) {
      // Document
      type = 'document';
      timestamp = entity.createdAt;
      description = entity.description;
    } else {
      // Task
      type = 'task';
      timestamp = entity.dueDate || entity.createdAt;
      description = entity.description;
    }
  } else {
    // Fallback
    type = 'note';
    timestamp = entity.createdAt;
    title = 'Untitled';
  }

  return {
    id: entity.id,
    type,
    entity,
    timestamp,
    displayDate: formatDisplayDate(timestamp),
    title,
    description,
    linkedItems: [],
  };
}
