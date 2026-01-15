/**
 * Personal Preferences
 * Store user preferences (e.g., "likes silence", "hates mornings")
 * Read-only for AI behavior adjustment, not for decisions
 * Never label the user explicitly
 */

import { EntityId } from '@/models';

export interface PersonalPreference {
  id: string;
  householdId: EntityId;
  preferenceType: 'interaction_style' | 'timing' | 'communication' | 'content';
  key: string; // e.g., "prefers_brief", "likes_silence_mornings"
  value: unknown; // Preference value
  confidence: number; // 0-1
  detectedAt: string; // ISO 8601
  lastObservedAt: string; // ISO 8601
  observationCount: number;
  context?: string; // When this preference applies
}

/**
 * Personal Preferences Tracker
 * Tracks user preferences without labeling
 */
export class PersonalPreferences {
  private preferences: PersonalPreference[] = [];
  private minObservations = 3;

  /**
   * Detect preferences from behavior patterns
   */
  detectPreference(params: {
    behavior: string; // Observed behavior
    context: string; // Context of behavior
    metadata?: Record<string, unknown>;
  }): PersonalPreference | null {
    // Analyze behavior patterns to infer preferences
    // This is read-only for behavior adjustment, not decisions
    
    const preferenceKey = this.inferPreferenceKey(params.behavior, params.context);
    if (!preferenceKey) return null;

    // Check if preference already exists
    const existing = this.preferences.find(p => p.key === preferenceKey.key);
    
    if (existing) {
      existing.observationCount += 1;
      existing.lastObservedAt = new Date().toISOString();
      existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      return existing;
    }

    // Create new preference
    const preference: PersonalPreference = {
      id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      householdId: 'household-1', // Would come from context
      preferenceType: preferenceKey.type,
      key: preferenceKey.key,
      value: preferenceKey.value,
      confidence: 0.5, // Start with low confidence
      detectedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1,
      context: params.context,
    };

    this.preferences.push(preference);
    return preference;
  }

  /**
   * Infer preference key from behavior
   */
  private inferPreferenceKey(behavior: string, context: string): {
    type: PersonalPreference['preferenceType'];
    key: string;
    value: unknown;
  } | null {
    const behaviorLower = behavior.toLowerCase();
    const contextLower = context.toLowerCase();

    // Interaction style preferences
    if (behaviorLower.includes('dismiss') || behaviorLower.includes('ignore')) {
      return {
        type: 'interaction_style',
        key: 'prefers_less_prompts',
        value: true,
      };
    }

    if (behaviorLower.includes('brief') || behaviorLower.includes('short')) {
      return {
        type: 'interaction_style',
        key: 'prefers_brief_responses',
        value: true,
      };
    }

    // Timing preferences
    if (contextLower.includes('morning') && behaviorLower.includes('dismiss')) {
      return {
        type: 'timing',
        key: 'less_engagement_mornings',
        value: true,
      };
    }

    if (contextLower.includes('late') || contextLower.includes('night')) {
      return {
        type: 'timing',
        key: 'less_engagement_nights',
        value: true,
      };
    }

    return null;
  }

  /**
   * Get preference by key
   */
  getPreference(key: string): PersonalPreference | null {
    return this.preferences.find(p => p.key === key) || null;
  }

  /**
   * Get preferences by type
   */
  getPreferencesByType(type: PersonalPreference['preferenceType']): PersonalPreference[] {
    return this.preferences.filter(p => p.preferenceType === type);
  }

  /**
   * Get all preferences
   */
  getAllPreferences(): PersonalPreference[] {
    return [...this.preferences];
  }

  /**
   * Check if preference is confirmed (high confidence, multiple observations)
   */
  isPreferenceConfirmed(key: string): boolean {
    const pref = this.getPreference(key);
    if (!pref) return false;
    
    return pref.confidence >= 0.7 && pref.observationCount >= this.minObservations;
  }
}

// Global instance
export const personalPreferences = new PersonalPreferences();
