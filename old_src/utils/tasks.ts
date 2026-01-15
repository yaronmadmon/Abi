/**
 * Task Utilities
 */

import { Task, TaskStatus, TaskPriority, Event } from '@/models';
import { CalendarConflict, RescheduleSuggestion } from '@/types/tasks';

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
    return false;
  }
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  return dueDate < now;
}

/**
 * Check if a task is due soon (within 24 hours)
 */
export function isTaskDueSoon(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
    return false;
  }
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return dueDate >= now && dueDate <= tomorrow;
}

/**
 * Get task priority color
 */
export function getTaskPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT:
      return '#E11D48';
    case TaskPriority.HIGH:
      return '#F59E0B';
    case TaskPriority.MEDIUM:
      return '#3B82F6';
    case TaskPriority.LOW:
      return '#737373';
    default:
      return '#737373';
  }
}

/**
 * Get task status label
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.PENDING:
      return 'Pending';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
    case TaskStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Format task due date for display
 */
export function formatTaskDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (itemDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear() !== now.getFullYear() ? `, ${date.getFullYear()}` : '';
  
  return `${month} ${day}${year}`;
}
