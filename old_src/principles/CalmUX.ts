/**
 * Calm UX Principles
 * Developer- and AI-facing constraints to enforce calm, non-pressured UX
 * Core principle: No urgency, no guilt, no pressure
 */

/**
 * Calm UX Rules
 * Enforces calm UX principles
 */
export class CalmUX {
  /**
   * Check if text contains urgency language
   */
  static containsUrgencyLanguage(text: string): boolean {
    const urgencyKeywords = [
      'urgent',
      'overdue',
      'you forgot',
      'you missed',
      'late',
      'critical',
      'asap',
      'immediately',
      'must do now',
      'hurry',
      'deadline passed',
      'past due',
    ];

    const lower = text.toLowerCase();
    return urgencyKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Check if text contains guilt language
   */
  static containsGuiltLanguage(text: string): boolean {
    const guiltKeywords = [
      'you forgot',
      'you missed',
      'you should have',
      'you didn\'t',
      'why didn\'t you',
      'should\'ve',
      'could\'ve',
      'you need to catch up',
      'behind on',
    ];

    const lower = text.toLowerCase();
    return guiltKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Check if text contains pressure language
   */
  static containsPressureLanguage(text: string): boolean {
    const pressureKeywords = [
      'must do',
      'have to',
      'need to',
      'should',
      'required',
      'mandatory',
      'obligated',
    ];

    const lower = text.toLowerCase();
    return pressureKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Validate text against calm UX principles
   */
  static validate(text: string): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (this.containsUrgencyLanguage(text)) {
      violations.push('contains_urgency');
    }

    if (this.containsGuiltLanguage(text)) {
      violations.push('contains_guilt');
    }

    // Note: Pressure language check is softer - we only flag excessive use
    // Some pressure language is necessary for task clarity
    const pressureCount = this.countPressureWords(text);
    if (pressureCount > 2) {
      violations.push('excessive_pressure');
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Count pressure words in text
   */
  private static countPressureWords(text: string): number {
    const pressureKeywords = [
      'must do',
      'have to',
      'need to',
      'should',
      'required',
      'mandatory',
    ];

    const lower = text.toLowerCase();
    return pressureKeywords.filter(keyword => lower.includes(keyword)).length;
  }

  /**
   * Get calm alternative for urgency language
   */
  static getCalmAlternative(text: string): string {
    const replacements: Record<string, string> = {
      'overdue': 'still open',
      'you forgot': 'this hasn\'t been handled yet',
      'you missed': 'this hasn\'t been handled yet',
      'late': 'still pending',
      'deadline passed': 'still open',
      'past due': 'still pending',
      'urgent': 'time-sensitive',
      'critical': 'important',
      'asap': 'soon',
      'immediately': 'soon',
      'must do now': 'when you can',
      'hurry': 'when convenient',
    };

    let result = text;
    const lower = text.toLowerCase();

    Object.entries(replacements).forEach(([bad, good]) => {
      const regex = new RegExp(`\\b${bad}\\b`, 'gi');
      if (regex.test(lower)) {
        result = result.replace(regex, good);
      }
    });

    return result;
  }

  /**
   * Enforce calm UX on text (replace violations)
   */
  static enforce(text: string): string {
    const validated = this.validate(text);
    
    if (validated.isValid) {
      return text;
    }

    // Replace urgency and guilt language
    let result = this.getCalmAlternative(text);

    // Remove excessive pressure
    if (validated.violations.includes('excessive_pressure')) {
      // This would need more sophisticated text processing
      // For now, just return the calm alternative
    }

    return result;
  }
}
