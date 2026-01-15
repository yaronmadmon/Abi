/**
 * Audit Log Utilities
 * Track all actions with explanations
 */

import {
  AuditLogEntry,
  AuditLogAction,
  AuditLogEntityType,
  ActionExplanation,
} from '@/types/trust';
import { EntityId } from '@/models';

/**
 * Create audit log entry
 */
export function createAuditLogEntry(
  action: AuditLogAction,
  entityType: AuditLogEntityType,
  entityId: string,
  userId: EntityId,
  householdId: EntityId,
  description: string,
  explanation?: string,
  metadata?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    householdId,
    userId,
    action,
    entityType,
    entityId,
    description,
    explanation,
    metadata,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate "Why did you do this?" explanation
 */
export async function generateActionExplanation(
  action: AuditLogAction,
  entityType: AuditLogEntityType,
  context: {
    entityId: string;
    previousState?: unknown;
    newState?: unknown;
    trigger?: string;
    userIntent?: string;
  }
): Promise<ActionExplanation> {
  // Placeholder implementation
  // In production, this would use AI to generate explanations
  
  let explanation = '';
  const reasoning: string[] = [];
  let confidence = 0.7;
  
  switch (action) {
    case AuditLogAction.CREATE:
      explanation = `Created ${entityType} because ${context.userIntent || 'you requested it'}`;
      reasoning.push(`User action: ${context.userIntent || 'create request'}`);
      reasoning.push(`Entity type: ${entityType}`);
      if (context.trigger) {
        reasoning.push(`Trigger: ${context.trigger}`);
      }
      break;
    
    case AuditLogAction.UPDATE:
      explanation = `Updated ${entityType} based on your changes`;
      reasoning.push(`Previous state: ${JSON.stringify(context.previousState)}`);
      reasoning.push(`New state: ${JSON.stringify(context.newState)}`);
      if (context.userIntent) {
        reasoning.push(`User intent: ${context.userIntent}`);
      }
      break;
    
    case AuditLogAction.DELETE:
      explanation = `Deleted ${entityType} because ${context.userIntent || 'you requested deletion'}`;
      reasoning.push(`User action: delete request`);
      reasoning.push(`Entity type: ${entityType}`);
      break;
    
    case AuditLogAction.AUTOMATION_TRIGGERED:
      explanation = `Automation triggered because ${context.trigger || 'trigger condition was met'}`;
      reasoning.push(`Trigger condition met: ${context.trigger || 'automated trigger'}`);
      reasoning.push(`Automated action executed on ${entityType}`);
      confidence = 0.9;
      break;
    
    case AuditLogAction.AI_ACTION:
      explanation = `AI action taken because ${context.userIntent || 'it determined this would be helpful'}`;
      reasoning.push(`AI determined action would be helpful`);
      reasoning.push(`Based on: ${context.trigger || 'context analysis'}`);
      confidence = 0.6;
      break;
    
    case AuditLogAction.MANUAL_OVERRIDE:
      explanation = `Manual override applied because you directly controlled the device`;
      reasoning.push(`Manual control detected`);
      reasoning.push(`User preference overrode automation`);
      confidence = 1.0;
      break;
    
    default:
      explanation = `Action ${action} performed on ${entityType}`;
      reasoning.push(`Action: ${action}`);
      reasoning.push(`Entity: ${entityType}`);
      break;
  }
  
  return {
    actionId: context.entityId,
    action,
    entityType,
    explanation,
    reasoning,
    confidence,
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Search audit logs
 */
export function searchAuditLogs(
  logs: AuditLogEntry[],
  query: string,
  filters?: {
    action?: AuditLogAction;
    entityType?: AuditLogEntityType;
    userId?: EntityId;
    startDate?: string;
    endDate?: string;
  }
): AuditLogEntry[] {
  let filtered = logs;
  
  // Apply filters
  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }
  
  if (filters?.entityType) {
    filtered = filtered.filter(log => log.entityType === filters.entityType);
  }
  
  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  
  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
  }
  
  // Search query
  if (query.trim()) {
    const queryLower = query.toLowerCase();
    filtered = filtered.filter(log => {
      const searchable = [
        log.description,
        log.explanation || '',
        log.action,
        log.entityType,
      ].join(' ').toLowerCase();
      
      return searchable.includes(queryLower);
    });
  }
  
  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Format audit log entry for display
 */
export function formatAuditLogEntry(log: AuditLogEntry): string {
  const date = new Date(log.timestamp).toLocaleString();
  return `[${date}] ${log.action.toUpperCase()} ${log.entityType}: ${log.description}`;
}

/**
 * Get audit log summary
 */
export function getAuditLogSummary(
  logs: AuditLogEntry[],
  days: number = 30
): {
  totalActions: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  recentActivity: AuditLogEntry[];
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentLogs = logs.filter(log => new Date(log.timestamp) >= cutoffDate);
  
  const byAction: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};
  
  recentLogs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
  });
  
  return {
    totalActions: recentLogs.length,
    byAction,
    byEntityType,
    recentActivity: recentLogs.slice(0, 50).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }),
  };
}
