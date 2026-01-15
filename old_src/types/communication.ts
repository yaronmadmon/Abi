/**
 * Communication Types
 * Email, contacts, and follow-up tracking
 */

import { EntityId } from '@/models';

export enum EmailStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  ARCHIVED = 'archived',
}

export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Email {
  id: string;
  threadId: string;
  householdId: EntityId;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  status: EmailStatus;
  priority: EmailPriority;
  receivedAt?: string; // ISO 8601
  sentAt?: string; // ISO 8601
  read: boolean;
  starred: boolean;
  attachmentIds?: EntityId[];
  labels?: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface EmailThread {
  id: string;
  householdId: EntityId;
  subject: string;
  emails: Email[];
  participantIds: EntityId[]; // Contact IDs
  lastActivityAt: string; // ISO 8601
  unreadCount: number;
  summary?: string; // AI-generated summary
}

export interface EmailDraft {
  id: string;
  householdId: EntityId;
  authorId: EntityId;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  isAiGenerated: boolean;
  requiresApproval: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface EmailSummary {
  threadId: string;
  summary: string;
  keyPoints: string[];
  actionItems?: string[];
  participants: string[];
  createdAt: string; // ISO 8601
}

// Contact types
export interface Contact {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
  householdId: EntityId;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
  notes?: string;
  tags: string[];
  relationship?: RelationshipType;
  relationshipNotes?: string; // AI-generated relationship context
  lastContactedAt?: string; // ISO 8601
  contactFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'rare';
  preferredContactMethod?: 'email' | 'phone' | 'text' | 'in-person';
}

export enum RelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  PROFESSIONAL = 'professional',
  SERVICE_PROVIDER = 'service_provider',
  OTHER = 'other',
}

// Follow-up tracking
export enum FollowUpStatus {
  WAITING = 'waiting',
  REMINDED = 'reminded',
  RESPONDED = 'responded',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export interface FollowUp {
  id: string;
  householdId: EntityId;
  relatedEmailId?: string;
  relatedThreadId?: string;
  contactId?: EntityId;
  title: string;
  description?: string;
  status: FollowUpStatus;
  waitingFor: string; // Who/what we're waiting for
  expectedResponseBy?: string; // ISO 8601
  lastReminderAt?: string; // ISO 8601
  reminderFrequency?: number; // Days between reminders
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  notes?: string;
}

interface BaseEntity {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSuggestion {
  contact: Contact;
  reason: string;
  confidence: number; // 0-1
  context?: string;
}

export interface EmailComposeData {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  priority?: EmailPriority;
  attachments?: File[];
}
