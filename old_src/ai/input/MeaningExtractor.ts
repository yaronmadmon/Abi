/**
 * Meaning Extractor
 * Extracts meaning and structure from normalized input
 * Part of InputParser refactor (structural, not functional)
 */

export interface ExtractedMeaning {
  type: 'task' | 'event' | 'note';
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent' | undefined;
  hasDate: boolean;
  hasTime: boolean;
  confidence: number;
}

/**
 * Meaning Extractor
 * Extracts semantic meaning from normalized text
 */
export class MeaningExtractor {
  /**
   * Extract meaning from normalized text
   */
  extract(text: string, normalized: string): ExtractedMeaning {
    // Detect type
    const type = this.detectType(normalized);
    
    // Extract title
    const title = this.extractTitle(text, type);
    
    // Extract description
    const description = this.extractDescription(text, title);
    
    // Extract priority
    const priority = this.extractPriority(normalized);
    
    // Check for dates/times
    const { hasDate, hasTime } = this.detectDateTime(normalized);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(text, type);

    return {
      type,
      title,
      description,
      priority,
      hasDate,
      hasTime,
      confidence,
    };
  }

  /**
   * Detect item type from text
   */
  private detectType(text: string): 'task' | 'event' | 'note' {
    const lower = text.toLowerCase();
    
    // Event indicators
    if (
      lower.match(/\b(at|meeting|appointment|call|zoom|schedule|event|happening)\b/) ||
      lower.match(/\b\d{1,2}:\d{2}\b/) || // time pattern
      lower.match(/\b(am|pm|morning|afternoon|evening|tonight)\b/)
    ) {
      return 'event';
    }
    
    // Task indicators
    if (
      lower.match(/\b(do|need|must|should|todo|task|remind|deadline|due)\b/) ||
      lower.match(/\b(tomorrow|next week|by)\b/)
    ) {
      return 'task';
    }
    
    // Default to note for everything else
    return 'note';
  }

  /**
   * Extract title from text
   */
  private extractTitle(text: string, type: 'task' | 'event' | 'note'): string {
    // Remove common prefixes
    let title = text
      .replace(/^(remember|note|todo|task|event|meeting|call|appointment):\s*/i, '')
      .replace(/^(i need to|i should|i must|i want to|please)\s+/i, '')
      .trim();
    
    // Take first sentence or first 60 chars
    const sentences = title.split(/[.!?;]/);
    title = sentences[0] || title;
    
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    return title.trim() || text.substring(0, 60).trim();
  }

  /**
   * Extract description from text (after title)
   */
  private extractDescription(text: string, title: string): string | null {
    if (text.length <= title.length) return null;
    
    const rest = text.substring(text.indexOf(title) + title.length).trim();
    if (rest.length < 5) return null;
    
    return rest.substring(0, 200).trim();
  }

  /**
   * Extract priority from text
   */
  private extractPriority(text: string): 'low' | 'medium' | 'high' | 'urgent' | undefined {
    const lower = text.toLowerCase();
    
    if (lower.match(/\b(urgent|asap|immediately|critical|important!)\b/)) {
      return 'urgent';
    }
    if (lower.match(/\b(important|priority|high|must)\b/)) {
      return 'high';
    }
    if (lower.match(/\b(low|optional|nice to have)\b/)) {
      return 'low';
    }
    
    return 'medium'; // default
  }

  /**
   * Detect date/time presence
   */
  private detectDateTime(text: string): { hasDate: boolean; hasTime: boolean } {
    const hasTime = /\b\d{1,2}:\d{2}\b/.test(text) || /\b(am|pm|morning|afternoon|evening|tonight)\b/.test(text);
    const hasDate = /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(text) ||
                     /\d{1,2}\/\d{1,2}/.test(text);
    
    return { hasDate, hasTime };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(text: string, type: 'task' | 'event' | 'note'): number {
    // Placeholder: simple confidence calculation
    let confidence = 0.7; // base confidence
    
    // Boost confidence if text has structure
    if (text.length > 10 && text.length < 200) {
      confidence += 0.1;
    }
    
    // Boost if has time/date indicators
    if (text.match(/\d/)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
}
