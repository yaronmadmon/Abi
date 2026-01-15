/**
 * Silence Rules
 * Enforces silence as a feature
 * Core principle: AI speaks only when it helps
 */

/**
 * Silence Rules
 * Determines when AI should remain silent
 */
export class SilenceRules {
  /**
   * Check if AI should remain silent
   */
  static shouldRemainSilent(params: {
    hasNewInfo: boolean;
    userDismissedPrompt: boolean;
    recentPromptsCount: number;
    timeSinceLastInteraction?: number; // Minutes
    userMood?: string;
    isOverwhelmed?: boolean;
  }): boolean {
    // If user dismissed prompt, remain silent
    if (params.userDismissedPrompt) {
      return true;
    }

    // If too many recent prompts, remain silent
    if (params.recentPromptsCount >= 2) {
      return true;
    }

    // If user is overwhelmed, remain silent
    if (params.isOverwhelmed) {
      return true;
    }

    // If no new information, remain silent
    if (!params.hasNewInfo) {
      return true;
    }

    // If user recently interacted, give space
    if (params.timeSinceLastInteraction !== undefined && params.timeSinceLastInteraction < 5) {
      // User just interacted, wait before speaking
      return true;
    }

    return false;
  }

  /**
   * Check if question is necessary
   */
  static isQuestionNecessary(params: {
    blocksAction: boolean;
    canProceedWithoutAnswer: boolean;
    confidence: number; // 0-1
    hasAskedRecently: boolean;
  }): boolean {
    // Only ask if it blocks action
    if (!params.blocksAction) {
      return false;
    }

    // Don't ask if we can proceed without answer
    if (params.canProceedWithoutAnswer) {
      return false;
    }

    // Don't ask if we've asked recently
    if (params.hasAskedRecently) {
      return false;
    }

    // Only ask if confidence is low
    if (params.confidence >= 0.7) {
      return false; // High enough confidence to proceed
    }

    return true;
  }

  /**
   * Check if prompt should be shown
   */
  static shouldShowPrompt(params: {
    hasUsefulInfo: boolean;
    isActionable: boolean;
    userEngagement: 'low' | 'medium' | 'high';
    timeOfDay?: number; // Hour (0-23)
    dayOfWeek?: number; // Day (0-6)
  }): boolean {
    // Don't show if no useful info
    if (!params.hasUsefulInfo) {
      return false;
    }

    // Don't show if not actionable
    if (!params.isActionable) {
      return false;
    }

    // Respect low engagement
    if (params.userEngagement === 'low') {
      return false;
    }

    // Avoid late night prompts (after 10 PM, before 7 AM)
    if (params.timeOfDay !== undefined) {
      if (params.timeOfDay >= 22 || params.timeOfDay < 7) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get silence reason (for debugging/logging)
   */
  static getSilenceReason(params: {
    hasNewInfo: boolean;
    userDismissedPrompt: boolean;
    recentPromptsCount: number;
    timeSinceLastInteraction?: number;
    userMood?: string;
    isOverwhelmed?: boolean;
  }): string | null {
    if (this.shouldRemainSilent(params)) {
      if (params.userDismissedPrompt) {
        return 'user_dismissed_prompt';
      }
      if (params.recentPromptsCount >= 2) {
        return 'too_many_recent_prompts';
      }
      if (params.isOverwhelmed) {
        return 'user_overwhelmed';
      }
      if (!params.hasNewInfo) {
        return 'no_new_info';
      }
      if (params.timeSinceLastInteraction !== undefined && params.timeSinceLastInteraction < 5) {
        return 'recent_interaction';
      }
    }

    return null;
  }
}
