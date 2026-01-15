/**
 * Decision Ledger
 * Logs every AI-initiated suggestion or planned action
 * For trust, transparency, and future explainability
 */

import { DecisionEntry, DecisionAlternative } from './DecisionEntry';
import { Intent, PlannedAction } from '../types';
import { calculateIntentConfidence, selectBestAlternative } from './DecisionConfidence';

/**
 * Decision Ledger Class
 * Maintains a complete log of all AI decisions
 */
export class DecisionLedger {
  private entries: DecisionEntry[] = [];
  private maxEntries: number = 1000; // Keep last 1000 decisions

  /**
   * Log a new decision
   */
  logDecision(params: {
    triggerInput: string;
    triggerType: DecisionEntry['triggerType'];
    inferredIntent: Intent;
    alternativesConsidered: DecisionAlternative[];
    selectedAction: PlannedAction | null;
    selectionReasoning: string;
    moodContext?: string;
    usagePatternContext?: string;
  }): DecisionEntry {
    const confidence = calculateIntentConfidence(params.inferredIntent);
    const bestAlternative = selectBestAlternative(params.alternativesConsidered);
    
    const entry: DecisionEntry = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      triggerInput: params.triggerInput,
      triggerType: params.triggerType,
      inferredIntent: params.inferredIntent,
      confidenceScore: confidence,
      alternativesConsidered: params.alternativesConsidered,
      selectedAction: params.selectedAction || (bestAlternative ? bestAlternative.action : null),
      selectionReasoning: params.selectionReasoning || bestAlternative?.reasoning || 'Selected best alternative',
      executed: false,
      moodContext: params.moodContext,
      usagePatternContext: params.usagePatternContext,
    };

    this.addEntry(entry);
    return entry;
  }

  /**
   * Mark decision as executed
   */
  markExecuted(
    decisionId: string,
    result: DecisionEntry['executionResult'],
    error?: string,
    auditLogId?: string
  ): void {
    const entry = this.entries.find(e => e.id === decisionId);
    if (entry) {
      entry.executed = true;
      entry.executedAt = new Date().toISOString();
      entry.executionResult = result;
      entry.executionError = error;
      entry.auditLogId = auditLogId;
    }
  }

  /**
   * Get decision by ID
   */
  getDecision(decisionId: string): DecisionEntry | null {
    return this.entries.find(e => e.id === decisionId) || null;
  }

  /**
   * Get decisions by entity
   */
  getDecisionsForEntity(entityId: string, entityType: string): DecisionEntry[] {
    return this.entries.filter(entry => {
      // Check if decision relates to this entity
      if (entry.selectedAction?.intent?.entities) {
        return entry.selectedAction.intent.entities.some(
          e => e.type === entityType && e.value === entityId
        );
      }
      return false;
    });
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 50): DecisionEntry[] {
    return this.entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get decisions with low confidence
   */
  getLowConfidenceDecisions(threshold: number = 0.6): DecisionEntry[] {
    return this.entries.filter(e => e.confidenceScore < threshold);
  }

  /**
   * Get decisions by date range
   */
  getDecisionsByDateRange(startDate: string, endDate: string): DecisionEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.entries.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * Get explanation for decision
   */
  getDecisionExplanation(decisionId: string): string {
    const entry = this.getDecision(decisionId);
    if (!entry) return 'Decision not found';

    const parts: string[] = [];
    parts.push(`Decision made at ${new Date(entry.timestamp).toLocaleString()}`);
    parts.push(`Trigger: ${entry.triggerInput}`);
    parts.push(`Intent: ${entry.inferredIntent.action} (confidence: ${Math.round(entry.confidenceScore * 100)}%)`);
    
    if (entry.alternativesConsidered.length > 1) {
      parts.push(`Considered ${entry.alternativesConsidered.length} alternatives`);
    }
    
    parts.push(`Selected: ${entry.selectionReasoning}`);
    
    if (entry.moodContext) {
      parts.push(`User mood context: ${entry.moodContext}`);
    }
    
    if (entry.executed) {
      parts.push(`Executed: ${entry.executionResult}`);
      if (entry.executionError) {
        parts.push(`Error: ${entry.executionError}`);
      }
    } else {
      parts.push('Status: Pending execution');
    }
    
    return parts.join('\n');
  }

  /**
   * Link related decisions
   */
  linkDecisions(decisionId1: string, decisionId2: string): void {
    const entry1 = this.entries.find(e => e.id === decisionId1);
    const entry2 = this.entries.find(e => e.id === decisionId2);
    
    if (entry1 && entry2) {
      entry1.relatedDecisionIds = [...(entry1.relatedDecisionIds || []), decisionId2];
      entry2.relatedDecisionIds = [...(entry2.relatedDecisionIds || []), decisionId1];
    }
  }

  /**
   * Add entry (maintains max size)
   */
  private addEntry(entry: DecisionEntry): void {
    this.entries.push(entry);
    
    // Maintain max size
    if (this.entries.length > this.maxEntries) {
      // Remove oldest entries
      this.entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Clear ledger (for testing or reset)
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get all entries (for export/debugging)
   */
  getAllEntries(): DecisionEntry[] {
    return [...this.entries];
  }
}

// Global instance
export const decisionLedger = new DecisionLedger();
