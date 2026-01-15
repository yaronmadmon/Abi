/**
 * Clarification Gate
 * Ensures max ONE follow-up question, only when ambiguity blocks action
 * Part of InputParser refactor (structural, not functional)
 */

import { ExtractedMeaning } from './MeaningExtractor';

export interface ClarificationQuestion {
  id: string;
  question: string;
  context: string;
  blocking: boolean; // Whether this blocks action
}

/**
 * Clarification Gate
 * Manages clarification questions with strict rules:
 * - Max ONE follow-up question
 * - Only when ambiguity blocks action
 */
export class ClarificationGate {
  private askedQuestions = new Set<string>(); // Track asked questions per session
  private maxQuestions = 1; // Maximum one question
  private minConfidenceThreshold = 0.4; // Below this, might need clarification

  /**
   * Check if clarification is needed
   */
  needsClarification(meaning: ExtractedMeaning, rawText: string): boolean {
    // Don't ask if we've already asked a question
    if (this.askedQuestions.size >= this.maxQuestions) {
      return false;
    }

    // Only ask if confidence is too low AND it blocks action
    if (meaning.confidence < this.minConfidenceThreshold) {
      return this.isAmbiguityBlocking(meaning);
    }

    return false;
  }

  /**
   * Generate clarification question if needed
   */
  generateQuestion(meaning: ExtractedMeaning, rawText: string): ClarificationQuestion | null {
    if (!this.needsClarification(meaning, rawText)) {
      return null;
    }

    const questionId = `clarify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine what needs clarification
    let question = '';
    let blocking = true;

    // Low confidence on type
    if (meaning.confidence < 0.5) {
      question = `Did you mean this as a ${meaning.type}, or something else?`;
      blocking = true;
    }
    // Missing date/time for event
    else if (meaning.type === 'event' && !meaning.hasTime && !meaning.hasDate) {
      question = `When is this happening?`;
      blocking = true;
    }
    // Missing date for task
    else if (meaning.type === 'task' && !meaning.hasDate) {
      // Not blocking - tasks can be without dates
      return null;
    }
    // Title too short
    else if (meaning.title.length < 5) {
      question = `Could you add a bit more detail about this?`;
      blocking = false; // Not blocking
      return null; // Don't ask for non-blocking
    }

    if (!question) {
      return null;
    }

    // Record that we asked
    this.askedQuestions.add(questionId);

    return {
      id: questionId,
      question,
      context: rawText,
      blocking,
    };
  }

  /**
   * Check if ambiguity blocks action
   */
  private isAmbiguityBlocking(meaning: ExtractedMeaning): boolean {
    // Low confidence on type is blocking
    if (meaning.confidence < 0.4) {
      return true;
    }

    // Missing critical info for events
    if (meaning.type === 'event' && !meaning.hasTime && !meaning.hasDate) {
      return true;
    }

    // Very short title with low confidence
    if (meaning.title.length < 5 && meaning.confidence < 0.5) {
      return true;
    }

    return false;
  }

  /**
   * Reset question tracking (for new session)
   */
  reset(): void {
    this.askedQuestions.clear();
  }

  /**
   * Check if we can ask more questions
   */
  canAskQuestion(): boolean {
    return this.askedQuestions.size < this.maxQuestions;
  }
}
