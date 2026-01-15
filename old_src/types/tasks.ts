/**
 * Task Management Types
 */

import { Task, Person, Event, TaskPriority } from '@/models';

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedToIds: string[];
  dueDate?: string; // ISO 8601
  tags: string[];
}

export interface TaskAssignment {
  taskId: string;
  personId: string;
  assignedAt: string; // ISO 8601
  status: 'pending' | 'accepted' | 'declined';
}

export enum FollowUpReason {
  NO_RESPONSE = 'no_response',
  NOT_COMPLETED = 'not_completed',
}

export interface TaskFollowUp {
  id: string;
  taskId: string;
  reason: FollowUpReason;
  createdAt: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  notes?: string;
}

export interface CalendarConflict {
  taskId: string;
  eventId: string;
  conflictType: 'overlap' | 'too_close';
  suggestedReschedule?: string; // ISO 8601
  severity: 'low' | 'medium' | 'high';
}

export interface RescheduleSuggestion {
  taskId: string;
  originalDate: string; // ISO 8601
  suggestedDate: string; // ISO 8601
  reason: string;
  confidence: number; // 0-1
}

export interface TaskNotification {
  id: string;
  taskId: string;
  type: 'created' | 'assigned' | 'completed' | 'follow_up' | 'reminder' | 'conflict';
  message: string;
  timestamp: string; // ISO 8601
  read: boolean;
  actionRequired: boolean; // Always false - informational only
}
