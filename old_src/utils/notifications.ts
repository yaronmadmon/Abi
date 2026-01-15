/**
 * Notification Utilities
 * Informational notifications only (no urgency)
 */

import { Task } from '@/models';
import { TaskNotification, TaskFollowUp } from '@/types/tasks';

/**
 * Create notification for task creation
 */
export function createTaskCreatedNotification(task: Task): TaskNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    taskId: task.id,
    type: 'created',
    message: `Task "${task.title}" has been created.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false, // Always false - informational only
  };
}

/**
 * Create notification for task assignment
 */
export function createTaskAssignedNotification(task: Task, personName: string): TaskNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    taskId: task.id,
    type: 'assigned',
    message: `"${task.title}" has been assigned to ${personName}.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false,
  };
}

/**
 * Create notification for task completion
 */
export function createTaskCompletedNotification(task: Task): TaskNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    taskId: task.id,
    type: 'completed',
    message: `"${task.title}" has been completed. Great work!`,
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false,
  };
}

/**
 * Create notification for follow-up
 */
export function createFollowUpNotification(followUp: TaskFollowUp, task: Task): TaskNotification {
  const message = getFollowUpMessage(followUp, task);
  
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    taskId: task.id,
    type: 'follow_up',
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false,
  };
}

/**
 * Create notification for calendar conflict
 */
export function createConflictNotification(
  task: Task,
  conflictType: string
): TaskNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    taskId: task.id,
    type: 'conflict',
    message: `"${task.title}" has a scheduling conflict. Would you like to reschedule?`,
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false,
  };
}

/**
 * Get follow-up message (shared with followups.ts)
 */
function getFollowUpMessage(followUp: TaskFollowUp, task: Task): string {
  switch (followUp.reason) {
    case 'no_response':
      return `Just checking in on "${task.title}" - no rush, just wanted to see how it's going.`;
    case 'not_completed':
      return `"${task.title}" is past due. If you need help or want to adjust the deadline, let me know.`;
    default:
      return `Just checking in on "${task.title}".`;
  }
}

// Export for use in followups.ts if needed
export { getFollowUpMessage };
