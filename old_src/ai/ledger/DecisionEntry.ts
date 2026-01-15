/**
 * Decision Entry Types
 * Represents a single AI decision with full transparency
 */

import { Intent, PlannedAction } from '../types';

export interface DecisionEntry {
  id: string;
  timestamp: string; // ISO 8601
  
  // Input context
  triggerInput: string;
  triggerType: 'user_input' | 'automation' | 'scheduled' | 'event';
  
  // Intent inference
  inferredIntent: Intent;
  confidenceScore: number; // 0-1
  
  // Decision process
  alternativesConsidered: DecisionAlternative[];
  selectedAction: PlannedAction | null;
  selectionReasoning: string;
  
  // Outcome tracking
  executed: boolean;
  executedAt?: string; // ISO 8601
  executionResult?: 'success' | 'partial' | 'failed' | 'cancelled';
  executionError?: string;
  
  // Linkage
  auditLogId?: string; // Link to audit log entry
  relatedDecisionIds?: string[]; // Related decisions
  
  // Metadata
  moodContext?: string; // User mood at time of decision
  usagePatternContext?: string; // Usage pattern context
}

export interface DecisionAlternative {
  action: PlannedAction;
  confidence: number; // 0-1
  reasoning: string;
  whyNotSelected?: string;
}
