/**
 * Email Utilities
 * Reading, sending, summarizing, and managing emails
 */

import { Email, EmailThread, EmailDraft, EmailSummary, EmailStatus, EmailPriority } from '@/types/communication';
import { EntityId } from '@/models';

/**
 * Summarize an email thread
 */
export async function summarizeEmailThread(thread: EmailThread): Promise<EmailSummary> {
  // Placeholder implementation
  // In production, this would use AI to generate a summary
  
  const emails = thread.emails.sort((a, b) => {
    const dateA = a.receivedAt || a.sentAt || a.createdAt;
    const dateB = b.receivedAt || b.sentAt || b.createdAt;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
  
  const participants = new Set<string>();
  emails.forEach(email => {
    participants.add(email.from.email);
    email.to.forEach(addr => participants.add(addr.email));
  });
  
  const keyPoints: string[] = [];
  const actionItems: string[] = [];
  
  // Extract key information (placeholder logic)
  emails.forEach((email, index) => {
    if (email.subject.toLowerCase().includes('action') || email.body.toLowerCase().includes('action required')) {
      actionItems.push(`Action required in email ${index + 1}`);
    }
    
    if (email.body.length > 100) {
      const preview = email.body.substring(0, 100).trim();
      keyPoints.push(preview + '...');
    }
  });
  
  const summary = `Thread with ${emails.length} email${emails.length !== 1 ? 's' : ''} about "${thread.subject}". ${participants.size} participant${participants.size !== 1 ? 's' : ''} involved.`;
  
  return {
    threadId: thread.id,
    summary,
    keyPoints: keyPoints.slice(0, 5), // Limit to 5 key points
    actionItems,
    participants: Array.from(participants),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get unread email count
 */
export function getUnreadEmailCount(emails: Email[]): number {
  return emails.filter(email => !email.read && email.status === EmailStatus.RECEIVED).length;
}

/**
 * Group emails into threads
 */
export function groupEmailsIntoThreads(emails: Email[]): EmailThread[] {
  const threadMap = new Map<string, Email[]>();
  
  emails.forEach(email => {
    const existing = threadMap.get(email.threadId) || [];
    existing.push(email);
    threadMap.set(email.threadId, existing);
  });
  
  const threads: EmailThread[] = [];
  
  threadMap.forEach((threadEmails, threadId) => {
    const sortedEmails = threadEmails.sort((a, b) => {
      const dateA = a.receivedAt || a.sentAt || a.createdAt;
      const dateB = b.receivedAt || b.sentAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    const lastEmail = sortedEmails[0];
    const participantIds = new Set<EntityId>();
    
    sortedEmails.forEach(email => {
      // Extract participant IDs (placeholder - would need contact lookup)
      email.to.forEach(addr => {
        // participantIds.add(addr.email); // Would map email to contact ID
      });
    });
    
    threads.push({
      id: threadId,
      householdId: lastEmail.householdId,
      subject: lastEmail.subject,
      emails: sortedEmails,
      participantIds: Array.from(participantIds),
      lastActivityAt: lastEmail.receivedAt || lastEmail.sentAt || lastEmail.createdAt,
      unreadCount: sortedEmails.filter(e => !e.read).length,
    });
  });
  
  return threads.sort((a, b) => {
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });
}

/**
 * Search emails
 */
export function searchEmails(emails: Email[], query: string): Email[] {
  if (!query.trim()) {
    return emails;
  }
  
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(Boolean);
  
  return emails.filter(email => {
    const searchableText = [
      email.subject,
      email.body,
      email.from.email,
      email.from.name || '',
      ...email.to.map(addr => `${addr.email} ${addr.name || ''}`),
      ...(email.labels || []),
    ].join(' ').toLowerCase();
    
    return queryTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Filter emails by status
 */
export function filterEmailsByStatus(emails: Email[], status: EmailStatus | null): Email[] {
  if (!status) {
    return emails;
  }
  
  return emails.filter(email => email.status === status);
}

/**
 * Mark email as read
 */
export function markEmailAsRead(email: Email): Email {
  return {
    ...email,
    read: true,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mark email as starred
 */
export function toggleEmailStar(email: Email): Email {
  return {
    ...email,
    starred: !email.starred,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get email priority color
 */
export function getEmailPriorityColor(priority: EmailPriority): string {
  switch (priority) {
    case EmailPriority.HIGH:
      return '#E11D48'; // Red
    case EmailPriority.NORMAL:
      return '#3B82F6'; // Blue
    case EmailPriority.LOW:
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}

/**
 * Format email date for display
 */
export function formatEmailDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (itemDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  
  if (itemDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generate AI draft from voice/text input
 */
export async function generateEmailDraft(
  input: string,
  recipient?: string,
  context?: string
): Promise<{ subject: string; body: string }> {
  // Placeholder implementation
  // In production, this would use AI to generate a proper email draft
  
  // Simple extraction (placeholder)
  let subject = 'New Message';
  let body = input;
  
  // Try to extract subject if format is "Subject: ... Body: ..."
  const subjectMatch = input.match(/subject:\s*(.+?)(?:\n|body:|$)/i);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = input.replace(/subject:\s*.+?(?:\n|body:|$)/i, '').replace(/^body:\s*/i, '').trim();
  }
  
  // Basic formatting
  if (recipient && !body.includes('Dear') && !body.includes('Hi')) {
    body = `Hi ${recipient},\n\n${body}\n\nBest regards`;
  }
  
  return { subject, body };
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse email addresses from string
 */
export function parseEmailAddresses(input: string): Array<{ email: string; name?: string }> {
  // Simple parser - in production would handle more formats
  const addresses: Array<{ email: string; name?: string }> = [];
  const parts = input.split(',').map(s => s.trim());
  
  parts.forEach(part => {
    const emailMatch = part.match(/([^<]+)?<([^>]+)>/) || part.match(/^(.+)$/);
    if (emailMatch) {
      const email = (emailMatch[2] || emailMatch[1] || '').trim();
      const name = emailMatch[1]?.trim();
      
      if (isValidEmail(email)) {
        addresses.push({ email, name: name || undefined });
      }
    }
  });
  
  return addresses;
}
