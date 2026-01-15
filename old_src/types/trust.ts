/**
 * Trust & Lifetime Readiness Types
 * Audit logs, privacy controls, explanations, undo
 */

import { EntityId } from '@/models';

export enum AuditLogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  SHARE = 'share',
  EXPORT = 'export',
  IMPORT = 'import',
  AUTOMATION_TRIGGERED = 'automation_triggered',
  AI_ACTION = 'ai_action',
  MANUAL_OVERRIDE = 'manual_override',
  SETTING_CHANGE = 'setting_change',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum AuditLogEntityType {
  TASK = 'task',
  EVENT = 'event',
  DOCUMENT = 'document',
  EMAIL = 'email',
  CONTACT = 'contact',
  BILL = 'bill',
  DEVICE = 'device',
  AUTOMATION = 'automation',
  USER = 'user',
  HOUSEHOLD = 'household',
  SETTING = 'setting',
}

export interface AuditLogEntry {
  id: string;
  householdId: EntityId;
  userId: EntityId;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  description: string;
  explanation?: string; // "Why did you do this?" explanation
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string; // ISO 8601
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  HOUSEHOLD = 'household',
  PRIVATE = 'private',
  SECRET = 'secret',
}

export interface PrivacySetting {
  id: string;
  householdId: EntityId;
  userId: EntityId;
  entityType: AuditLogEntityType;
  defaultPrivacy: PrivacyLevel;
  allowSharing: boolean;
  allowExport: boolean;
  allowAIAccess: boolean;
  requireExplicitConsent: boolean;
  dataRetentionDays?: number; // Auto-delete after X days
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ActionExplanation {
  actionId: string;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  explanation: string;
  reasoning: string[]; // Step-by-step reasoning
  confidence: number; // 0-1
  context: Record<string, unknown>;
  timestamp: string; // ISO 8601
}

export enum UndoActionType {
  UNDO = 'undo',
  REDO = 'redo',
}

export interface UndoableAction {
  id: string;
  type: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  undoAction: () => Promise<void>;
  redoAction: () => Promise<void>;
  description: string;
  timestamp: string; // ISO 8601
}

export interface UndoHistory {
  past: UndoableAction[]; // Actions that can be undone
  future: UndoableAction[]; // Actions that can be redone
  maxHistorySize: number;
}

export interface DataExport {
  id: string;
  householdId: EntityId;
  userId: EntityId;
  format: 'json' | 'csv' | 'pdf';
  includes: AuditLogEntityType[];
  exportedAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601
  downloadUrl?: string;
}

export interface DataDeletion {
  id: string;
  householdId: EntityId;
  userId: EntityId;
  entityType: AuditLogEntityType;
  entityId: string;
  deletedAt: string; // ISO 8601
  reason?: string;
  canRestore: boolean;
  restoreUntil?: string; // ISO 8601
}
