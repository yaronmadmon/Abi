/**
 * Privacy Control Utilities
 * Manage privacy settings and data controls
 */

import {
  PrivacySetting,
  PrivacyLevel,
  AuditLogEntityType,
  DataExport,
  DataDeletion,
} from '@/types/trust';
import { EntityId } from '@/models';

/**
 * Get default privacy setting
 */
export function getDefaultPrivacySetting(
  entityType: AuditLogEntityType
): PrivacyLevel {
  // Sensitive data defaults to private
  const privateTypes: AuditLogEntityType[] = [
    AuditLogEntityType.DOCUMENT,
    AuditLogEntityType.EMAIL,
    AuditLogEntityType.BILL,
    AuditLogEntityType.USER,
  ];
  
  if (privateTypes.includes(entityType)) {
    return PrivacyLevel.PRIVATE;
  }
  
  // Household-level data
  const householdTypes: AuditLogEntityType[] = [
    AuditLogEntityType.TASK,
    AuditLogEntityType.EVENT,
    AuditLogEntityType.DEVICE,
    AuditLogEntityType.AUTOMATION,
  ];
  
  if (householdTypes.includes(entityType)) {
    return PrivacyLevel.HOUSEHOLD;
  }
  
  return PrivacyLevel.PRIVATE;
}

/**
 * Check if action is allowed based on privacy settings
 */
export function isActionAllowed(
  privacy: PrivacySetting,
  action: 'share' | 'export' | 'ai_access'
): boolean {
  switch (action) {
    case 'share':
      return privacy.allowSharing;
    case 'export':
      return privacy.allowExport;
    case 'ai_access':
      return privacy.allowAIAccess;
    default:
      return false;
  }
}

/**
 * Create data export
 */
export function createDataExport(
  householdId: EntityId,
  userId: EntityId,
  format: 'json' | 'csv' | 'pdf',
  includes: AuditLogEntityType[],
  expiresInDays: number = 7
): DataExport {
  const exportedAt = new Date();
  const expiresAt = new Date(exportedAt);
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  return {
    id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    householdId,
    userId,
    format,
    includes,
    exportedAt: exportedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Create data deletion record
 */
export function createDataDeletion(
  householdId: EntityId,
  userId: EntityId,
  entityType: AuditLogEntityType,
  entityId: string,
  reason?: string,
  restoreWindowDays: number = 30
): DataDeletion {
  const deletedAt = new Date();
  const restoreUntil = new Date(deletedAt);
  restoreUntil.setDate(restoreUntil.getDate() + restoreWindowDays);
  
  return {
    id: `deletion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    householdId,
    userId,
    entityType,
    entityId,
    deletedAt: deletedAt.toISOString(),
    reason,
    canRestore: true,
    restoreUntil: restoreUntil.toISOString(),
  };
}

/**
 * Format privacy level for display
 */
export function formatPrivacyLevel(level: PrivacyLevel): string {
  switch (level) {
    case PrivacyLevel.PUBLIC:
      return 'Public';
    case PrivacyLevel.HOUSEHOLD:
      return 'Household';
    case PrivacyLevel.PRIVATE:
      return 'Private';
    case PrivacyLevel.SECRET:
      return 'Secret';
    default:
      return 'Unknown';
  }
}

/**
 * Get privacy level description
 */
export function getPrivacyLevelDescription(level: PrivacyLevel): string {
  switch (level) {
    case PrivacyLevel.PUBLIC:
      return 'Visible to everyone';
    case PrivacyLevel.HOUSEHOLD:
      return 'Visible to household members';
    case PrivacyLevel.PRIVATE:
      return 'Visible only to you';
    case PrivacyLevel.SECRET:
      return 'Highly restricted access';
    default:
      return 'Unknown privacy level';
  }
}
