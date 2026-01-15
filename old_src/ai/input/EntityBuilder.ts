/**
 * Entity Builder
 * Builds structured entities from extracted meaning
 * Part of InputParser refactor (structural, not functional)
 */

import { ParsedItem } from '@/types/today';
import { ExtractedMeaning } from './MeaningExtractor';

/**
 * Entity Builder
 * Builds structured entities from extracted meaning
 */
export class EntityBuilder {
  /**
   * Build parsed item from extracted meaning
   */
  build(meaning: ExtractedMeaning, rawText: string): ParsedItem {
    // Extract dates/times
    const { dueDate, startTime, endTime } = this.extractDates(rawText);

    return {
      id: this.generateId(),
      type: meaning.type,
      title: meaning.title,
      description: meaning.description || undefined,
      dueDate,
      startTime,
      endTime,
      priority: meaning.priority,
      confidence: meaning.confidence,
      rawText,
    };
  }

  /**
   * Extract dates and times from text
   */
  private extractDates(text: string): {
    dueDate?: string;
    startTime?: string;
    endTime?: string;
  } {
    const result: {
      dueDate?: string;
      startTime?: string;
      endTime?: string;
    } = {};
    
    // Placeholder: simple date/time extraction
    // In future phases, this would use a date parser library
    const timeMatch = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i);
    if (timeMatch) {
      // Simple time format (would need proper parsing in future)
      result.startTime = timeMatch[0];
    }
    
    // Today/tomorrow detection
    const lower = text.toLowerCase();
    if (lower.includes('today')) {
      const today = new Date();
      result.dueDate = today.toISOString().split('T')[0];
    } else if (lower.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      result.dueDate = tomorrow.toISOString().split('T')[0];
    }
    
    return result;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `parsed-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
