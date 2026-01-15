/**
 * Follow-up Tracking Utilities
 * "Waiting for reply" and gentle reminders
 */

import { FollowUp, FollowUpStatus } from '@/types/communication';
import { Email } from '@/types/communication';

/**
 * Create a follow-up from an email
 */
export function createFollowUpFromEmail(
  email: Email,
  waitingFor: string,
  expectedResponseBy?: string
): FollowUp {
  return {
    id: `followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    householdId: email.householdId,
    relatedEmailId: email.id,
    relatedThreadId: email.threadId,
    title: `Waiting for reply: ${email.subject}`,
    description: `Waiting for response from ${email.to.map(addr => addr.name || addr.email).join(', ')}`,
    status: FollowUpStatus.WAITING,
    waitingFor,
    expectedResponseBy,
    reminderFrequency: 3, // Default: remind every 3 days
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if follow-up needs a reminder
 */
export function shouldSendReminder(followUp: FollowUp): boolean {
  if (followUp.status !== FollowUpStatus.WAITING && followUp.status !== FollowUpStatus.REMINDED) {
    return false;
  }
  
  if (!followUp.lastReminderAt && !followUp.reminderFrequency) {
    // First reminder after creation date + reminder frequency
    const createdDate = new Date(followUp.createdAt);
    const reminderDate = new Date(createdDate);
    reminderDate.setDate(reminderDate.getDate() + (followUp.reminderFrequency || 3));
    
    return new Date() >= reminderDate;
  }
  
  if (followUp.lastReminderAt && followUp.reminderFrequency) {
    // Subsequent reminders
    const lastReminderDate = new Date(followUp.lastReminderAt);
    const nextReminderDate = new Date(lastReminderDate);
    nextReminderDate.setDate(nextReminderDate.getDate() + followUp.reminderFrequency);
    
    return new Date() >= nextReminderDate;
  }
  
  return false;
}

/**
 * Get follow-ups that need reminders
 */
export function getFollowUpsNeedingReminders(followUps: FollowUp[]): FollowUp[] {
  return followUps.filter(shouldSendReminder);
}

/**
 * Send a gentle reminder (marks as reminded)
 */
export function sendGentleReminder(followUp: FollowUp, notes?: string): FollowUp {
  return {
    ...followUp,
    status: FollowUpStatus.REMINDED,
    lastReminderAt: new Date().toISOString(),
    notes: notes ? `${followUp.notes || ''}\n[Reminder ${new Date().toLocaleDateString()}] ${notes}`.trim() : followUp.notes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mark follow-up as responded
 */
export function markFollowUpAsResponded(followUp: FollowUp, notes?: string): FollowUp {
  return {
    ...followUp,
    status: FollowUpStatus.RESPONDED,
    resolvedAt: new Date().toISOString(),
    notes: notes ? `${followUp.notes || ''}\n[Responded ${new Date().toLocaleDateString()}] ${notes}`.trim() : followUp.notes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resolve follow-up
 */
export function resolveFollowUp(followUp: FollowUp, notes?: string): FollowUp {
  return {
    ...followUp,
    status: FollowUpStatus.RESOLVED,
    resolvedAt: new Date().toISOString(),
    notes: notes ? `${followUp.notes || ''}\n[Resolved ${new Date().toLocaleDateString()}] ${notes}`.trim() : followUp.notes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if follow-up is overdue
 */
export function isFollowUpOverdue(followUp: FollowUp): boolean {
  if (!followUp.expectedResponseBy) {
    return false;
  }
  
  return new Date() > new Date(followUp.expectedResponseBy) && 
         (followUp.status === FollowUpStatus.WAITING || followUp.status === FollowUpStatus.REMINDED);
}

/**
 * Get overdue follow-ups
 */
export function getOverdueFollowUps(followUps: FollowUp[]): FollowUp[] {
  return followUps.filter(isFollowUpOverdue);
}

/**
 * Get follow-up status display name
 */
export function getFollowUpStatusLabel(status: FollowUpStatus): string {
  switch (status) {
    case FollowUpStatus.WAITING:
      return 'Waiting';
    case FollowUpStatus.REMINDED:
      return 'Reminded';
    case FollowUpStatus.RESPONDED:
      return 'Responded';
    case FollowUpStatus.RESOLVED:
      return 'Resolved';
    case FollowUpStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Get follow-up status color
 */
export function getFollowUpStatusColor(status: FollowUpStatus): string {
  switch (status) {
    case FollowUpStatus.WAITING:
      return '#F59E0B'; // Amber
    case FollowUpStatus.REMINDED:
      return '#E11D48'; // Red
    case FollowUpStatus.RESPONDED:
      return '#10B981'; // Green
    case FollowUpStatus.RESOLVED:
      return '#6B7280'; // Gray
    case FollowUpStatus.CANCELLED:
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}

/**
 * Format expected response date
 */
export function formatExpectedResponseDate(dateString?: string): string {
  if (!dateString) {
    return 'No deadline';
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} overdue`;
  } else if (daysDiff === 0) {
    return 'Due today';
  } else if (daysDiff === 1) {
    return 'Due tomorrow';
  } else if (daysDiff <= 7) {
    return `Due in ${daysDiff} days`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
