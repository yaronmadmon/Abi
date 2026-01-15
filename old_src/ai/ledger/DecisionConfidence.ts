/**
 * Decision Confidence Utilities
 * Calculate and validate confidence scores
 */

import { DecisionEntry, DecisionAlternative } from './DecisionEntry';
import { Intent } from '../types';

/**
 * Calculate confidence score for intent
 */
export function calculateIntentConfidence(intent: Intent): number {
  // Base confidence from intent
  let confidence = intent.confidence;
  
  // Adjust based on entities extracted
  if (intent.entities.length > 0) {
    const avgEntityConfidence = intent.entities.reduce((sum, e) => sum + e.confidence, 0) / intent.entities.length;
    confidence = (confidence + avgEntityConfidence) / 2;
  }
  
  // Lower confidence if action is UNKNOWN
  if (intent.action === 'unknown') {
    confidence *= 0.5;
  }
  
  // Lower confidence if category is UNKNOWN
  if (intent.category === 'unknown') {
    confidence *= 0.7;
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * Validate confidence threshold
 * Returns true if confidence is high enough for action
 */
export function meetsConfidenceThreshold(confidence: number, threshold: number = 0.6): boolean {
  return confidence >= threshold;
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

/**
 * Get confidence warning message (for low confidence)
 */
export function getConfidenceWarning(confidence: number): string | null {
  if (confidence < 0.5) {
    return 'Low confidence - please review carefully';
  }
  return null;
}

/**
 * Compare alternatives and select best
 */
export function selectBestAlternative(alternatives: DecisionAlternative[]): DecisionAlternative | null {
  if (alternatives.length === 0) return null;
  
  // Sort by confidence (highest first)
  const sorted = [...alternatives].sort((a, b) => b.confidence - a.confidence);
  
  // Return highest confidence alternative
  return sorted[0];
}

/**
 * Explain why alternative was not selected
 */
export function explainWhyNotSelected(
  selected: DecisionAlternative,
  alternatives: DecisionAlternative[]
): string[] {
  const reasons: string[] = [];
  
  const notSelected = alternatives.filter(alt => 
    alt.action.id !== selected.action.id
  );
  
  notSelected.forEach(alt => {
    if (alt.confidence < selected.confidence) {
      reasons.push(`${alt.reasoning} (confidence: ${Math.round(alt.confidence * 100)}% vs ${Math.round(selected.confidence * 100)}%)`);
    }
  });
  
  return reasons;
}
