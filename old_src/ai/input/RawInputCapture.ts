/**
 * Raw Input Capture
 * Captures and normalizes raw user input
 * Part of InputParser refactor (structural, not functional)
 */

import { Input } from '../types';

export interface CapturedInput {
  raw: string;
  normalized: string;
  type: Input['type'];
  source: string;
  timestamp: string;
}

/**
 * Raw Input Capture
 * Handles initial input capture and normalization
 */
export class RawInputCapture {
  /**
   * Capture input
   */
  capture(input: Input): CapturedInput {
    return {
      raw: input.content,
      normalized: input.content.toLowerCase().trim(),
      type: input.type,
      source: input.source || 'user',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Split text into sentences/clauses
   */
  splitIntoSentences(text: string): string[] {
    // Simple split on common delimiters
    return text
      .split(/[.!?;]\s+|\.\s+|,\s+(?=[A-Z])/g)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());
  }

  /**
   * Validate input
   */
  isValid(captured: CapturedInput): boolean {
    return captured.normalized.length > 0;
  }
}
