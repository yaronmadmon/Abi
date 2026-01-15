/**
 * Timeline Types
 * Unified timeline (Second Brain) data structures
 */

import { Task, Event, Note, Document } from '@/models';

export type TimelineEntity = Task | Event | Note | Document;

export type TimelineItemType = 'task' | 'event' | 'note' | 'document';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  entity: TimelineEntity;
  timestamp: string; // ISO 8601 - for sorting
  displayDate: string; // Human-readable date
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  linkedItems?: string[]; // IDs of related items
}

export enum TimelinePeriod {
  PAST = 'past',
  PRESENT = 'present',
  UPCOMING = 'upcoming',
}

export interface TimelineSection {
  period: TimelinePeriod;
  label: string;
  items: TimelineItem[];
}

export interface SearchQuery {
  id: string;
  query: string;
  type: 'semantic' | 'keyword';
  results?: TimelineItem[];
  timestamp: string;
}
