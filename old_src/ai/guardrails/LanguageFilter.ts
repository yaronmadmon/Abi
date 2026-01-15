/**
 * Language Filter
 * Prevents emotionally harmful language
 * Replaces pressure language with neutral alternatives
 */

import { CalmUX } from '@/principles/CalmUX';

/**
 * Language Filter
 * Filters and replaces harmful language in AI-generated text
 */
export class LanguageFilter {
  /**
   * Filter text for harmful language
   */
  static filter(text: string): string {
    // Apply calm UX enforcement
    return CalmUX.enforce(text);
  }

  /**
   * Replace urgency language
   */
  static replaceUrgency(text: string): string {
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
      'deadline is approaching': 'due soon',
      'running out of time': 'due soon',
    };

    let result = text;
    const lower = text.toLowerCase();

    Object.entries(replacements).forEach(([bad, good]) => {
      const regex = new RegExp(`\\b${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(lower)) {
        result = result.replace(regex, good);
      }
    });

    return result;
  }

  /**
   * Replace guilt language
   */
  static replaceGuilt(text: string): string {
    const replacements: Record<string, string> = {
      'you forgot': 'this hasn\'t been handled yet',
      'you missed': 'this hasn\'t been handled yet',
      'you should have': 'this could have been',
      'you didn\'t': 'this wasn\'t',
      'why didn\'t you': 'this could be',
      'should\'ve': 'could have',
      'could\'ve': 'might have',
      'you need to catch up': 'here are some items',
      'behind on': 'here are some items',
    };

    let result = text;
    const lower = text.toLowerCase();

    Object.entries(replacements).forEach(([bad, good]) => {
      const regex = new RegExp(`\\b${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(lower)) {
        result = result.replace(regex, good);
      }
    });

    return result;
  }

  /**
   * Replace pressure language (softened)
   */
  static replacePressure(text: string): string {
    // Soften pressure language while maintaining meaning
    const replacements: Record<string, string> = {
      'must do': 'to do',
      'have to': 'can',
      'need to': 'could',
      // Note: 'should' is acceptable in context, only replace if excessive
    };

    let result = text;
    const lower = text.toLowerCase();

    // Count pressure words
    const pressureCount = (lower.match(/\b(must|have to|need to)\b/g) || []).length;
    
    // Only replace if excessive (more than 2 instances)
    if (pressureCount > 2) {
      Object.entries(replacements).forEach(([bad, good]) => {
        const regex = new RegExp(`\\b${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(lower)) {
          result = result.replace(regex, good);
        }
      });
    }

    return result;
  }

  /**
   * Apply all filters
   */
  static applyAll(text: string): string {
    let result = text;
    
    // Apply in order: urgency, guilt, pressure
    result = this.replaceUrgency(result);
    result = this.replaceGuilt(result);
    result = this.replacePressure(result);
    
    // Final validation
    result = CalmUX.enforce(result);
    
    return result;
  }

  /**
   * Check if text needs filtering
   */
  static needsFiltering(text: string): boolean {
    const validation = CalmUX.validate(text);
    return !validation.isValid;
  }

  /**
   * Get violations in text
   */
  static getViolations(text: string): string[] {
    const validation = CalmUX.validate(text);
    return validation.violations;
  }
}
