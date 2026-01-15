/**
 * Today Screen Types
 */

import { Task, Event, Note } from '@/models';

export type TodayItemType = 'task' | 'event' | 'reminder';

export interface TodayItem {
  id: string;
  type: TodayItemType;
  title: string;
  description?: string;
  time?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  entity?: Task | Event | Note;
}

export interface ParsedItem {
  id: string;
  type: 'task' | 'event' | 'note';
  title: string;
  description?: string;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  rawText: string;
}
