/**
 * Intent Normalizer
 * Normalizes input into structured intents
 */

import { Input, Intent, IntentCategory, IntentAction, IntentEntity } from '../types';

export class IntentNormalizer {
  /**
   * Normalize input into an intent
   * This is a placeholder - no actual AI/ML logic yet
   */
  async normalize(input: Input): Promise<Intent> {
    // Placeholder implementation
    // In future phases, this would use NLP/AI to determine intent
    
    const normalizedText = this.preprocessText(input.content);
    const category = this.detectCategory(normalizedText);
    const action = this.detectAction(normalizedText, category);
    const entities = this.extractEntities(normalizedText);
    const confidence = this.calculateConfidence(category, action);

    return {
      id: this.generateId(),
      category,
      action,
      confidence,
      entities,
      originalInput: input,
      normalizedText,
    };
  }

  /**
   * Preprocess text for intent detection
   */
  private preprocessText(text: string): string {
    return text.toLowerCase().trim();
  }

  /**
   * Detect intent category from text
   * Placeholder - returns UNKNOWN for now
   */
  private detectCategory(text: string): IntentCategory {
    // Placeholder: simple keyword matching
    if (this.containsKeywords(text, ['task', 'todo', 'reminder'])) {
      return IntentCategory.TASK;
    }
    if (this.containsKeywords(text, ['event', 'meeting', 'appointment', 'calendar'])) {
      return IntentCategory.EVENT;
    }
    if (this.containsKeywords(text, ['bill', 'payment', 'invoice', 'subscription', 'financial', 'expense'])) {
      return IntentCategory.BILL;
    }
    if (this.containsKeywords(text, ['note', 'remember', 'write down'])) {
      return IntentCategory.NOTE;
    }
    if (this.containsKeywords(text, ['document', 'file', 'upload', 'scan', 'sign', 'signature'])) {
      return IntentCategory.DOCUMENT;
    }
    if (this.containsKeywords(text, ['email', 'mail', 'send', 'message', 'inbox'])) {
      return IntentCategory.DOCUMENT; // Using DOCUMENT category for email for now
    }
    if (this.containsKeywords(text, ['contact', 'person', 'relationship'])) {
      return IntentCategory.PERSON;
    }
    
    return IntentCategory.UNKNOWN;
  }

  /**
   * Detect action from text and category
   * Placeholder implementation
   */
  private detectAction(text: string, category: IntentCategory): IntentAction {
    // Placeholder: simple keyword matching
    if (this.containsKeywords(text, ['create', 'add', 'new', 'make', 'upload', 'scan'])) {
      switch (category) {
        case IntentCategory.TASK:
          return IntentAction.CREATE_TASK;
        case IntentCategory.EVENT:
          return IntentAction.CREATE_EVENT;
        case IntentCategory.BILL:
          return IntentAction.CREATE_BILL;
        case IntentCategory.NOTE:
          return IntentAction.CREATE_NOTE;
        case IntentCategory.DOCUMENT:
          return IntentAction.UPLOAD_DOCUMENT;
        default:
          return IntentAction.UNKNOWN;
      }
    }
    
    if (this.containsKeywords(text, ['list', 'show', 'get', 'what', 'find'])) {
      switch (category) {
        case IntentCategory.TASK:
          return IntentAction.LIST_TASKS;
        case IntentCategory.EVENT:
          return IntentAction.LIST_EVENTS;
        case IntentCategory.BILL:
          return IntentAction.LIST_BILLS;
        case IntentCategory.DOCUMENT:
          if (this.containsKeywords(text, ['email', 'mail', 'send', 'message'])) {
            if (this.containsKeywords(text, ['draft', 'write', 'compose'])) {
              return IntentAction.DRAFT_EMAIL;
            }
            return IntentAction.SEND_EMAIL;
          }
          if (this.containsKeywords(text, ['read', 'view', 'show'])) {
            return IntentAction.READ_EMAIL;
          }
          if (this.containsKeywords(text, ['search', 'find'])) {
            return IntentAction.SEARCH_EMAILS;
          }
          if (this.containsKeywords(text, ['list', 'inbox'])) {
            return IntentAction.LIST_EMAILS;
          }
          if (this.containsKeywords(text, ['summarize', 'summary'])) {
            return IntentAction.SUMMARIZE_THREAD;
          }
          if (this.containsKeywords(text, ['sign', 'signature'])) {
            if (this.containsKeywords(text, ['send', 'request'])) {
              return IntentAction.SEND_FOR_SIGNATURE;
            }
            return IntentAction.SIGN_DOCUMENT;
          }
          return IntentAction.LIST_DOCUMENTS;
        case IntentCategory.PERSON:
          if (this.containsKeywords(text, ['contact', 'suggest', 'who'])) {
            return IntentAction.SUGGEST_CONTACTS;
          }
          if (this.containsKeywords(text, ['list', 'show'])) {
            return IntentAction.LIST_CONTACTS;
          }
          if (this.containsKeywords(text, ['create', 'add'])) {
            return IntentAction.CREATE_CONTACT;
          }
          return IntentAction.GET_PERSON;
        default:
          return IntentAction.SEARCH;
      }
    }
    
    if (this.containsKeywords(text, ['follow', 'remind', 'waiting'])) {
      if (this.containsKeywords(text, ['create', 'add', 'set'])) {
        return IntentAction.CREATE_FOLLOWUP;
      }
      if (this.containsKeywords(text, ['send', 'remind'])) {
        return IntentAction.SEND_REMINDER;
      }
      return IntentAction.LIST_FOLLOWUPS;
    }

    return IntentAction.UNKNOWN;
  }

  /**
   * Extract entities from text
   * Placeholder - returns empty array for now
   */
  private extractEntities(text: string): IntentEntity[] {
    // Placeholder: no entity extraction yet
    return [];
  }

  /**
   * Calculate confidence score
   * Placeholder - returns fixed values for now
   */
  private calculateConfidence(category: IntentCategory, action: IntentAction): number {
    if (category === IntentCategory.UNKNOWN || action === IntentAction.UNKNOWN) {
      return 0.3;
    }
    return 0.7; // Placeholder confidence
  }

  /**
   * Helper: Check if text contains any keywords
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `intent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
