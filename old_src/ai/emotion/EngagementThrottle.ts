/**
 * Engagement Throttle
 * Enforces silence rules and prevents AI from being too talkative
 * Core principle: If user dismisses prompts, reduce engagement
 */

export interface EngagementMetrics {
  totalPromptsShown: number;
  dismissals: number;
  acceptances: number;
  lastPromptAt?: string; // ISO 8601
  lastDismissalAt?: string; // ISO 8601
  consecutiveDismissals: number;
}

/**
 * Engagement Throttle
 * Tracks engagement and enforces silence rules
 */
export class EngagementThrottle {
  private metrics: EngagementMetrics = {
    totalPromptsShown: 0,
    dismissals: 0,
    acceptances: 0,
    consecutiveDismissals: 0,
  };

  /**
   * Record prompt shown
   */
  recordPromptShown(): void {
    this.metrics.totalPromptsShown += 1;
    this.metrics.lastPromptAt = new Date().toISOString();
  }

  /**
   * Record prompt dismissed
   */
  recordDismissal(): void {
    this.metrics.dismissals += 1;
    this.metrics.consecutiveDismissals += 1;
    this.metrics.lastDismissalAt = new Date().toISOString();
  }

  /**
   * Record prompt accepted
   */
  recordAcceptance(): void {
    this.metrics.acceptances += 1;
    this.metrics.consecutiveDismissals = 0; // Reset on acceptance
  }

  /**
   * Check if engagement should be throttled
   */
  shouldThrottle(): boolean {
    // If user has dismissed 2+ consecutive prompts, throttle
    if (this.metrics.consecutiveDismissals >= 2) {
      return true;
    }

    // If dismissal rate is >50%, throttle
    if (this.metrics.totalPromptsShown > 0) {
      const dismissalRate = this.metrics.dismissals / this.metrics.totalPromptsShown;
      if (dismissalRate > 0.5) {
        return true;
      }
    }

    // If recently dismissed, throttle for a period
    if (this.metrics.lastDismissalAt) {
      const lastDismissal = new Date(this.metrics.lastDismissalAt);
      const now = new Date();
      const minutesSinceDismissal = (now.getTime() - lastDismissal.getTime()) / (1000 * 60);
      
      // Throttle for 30 minutes after dismissal
      if (minutesSinceDismissal < 30) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get throttle level (0 = no throttle, 1 = full throttle)
   */
  getThrottleLevel(): number {
    if (!this.shouldThrottle()) {
      return 0;
    }

    // Calculate throttle level based on dismissals
    if (this.metrics.consecutiveDismissals >= 3) {
      return 1.0; // Full throttle
    }

    if (this.metrics.consecutiveDismissals >= 2) {
      return 0.8; // Strong throttle
    }

    if (this.metrics.totalPromptsShown > 0) {
      const dismissalRate = this.metrics.dismissals / this.metrics.totalPromptsShown;
      if (dismissalRate > 0.7) {
        return 0.9; // Very strong throttle
      }
      if (dismissalRate > 0.5) {
        return 0.7; // Moderate throttle
      }
    }

    return 0.5; // Light throttle
  }

  /**
   * Calculate delay before next prompt (in minutes)
   */
  getPromptDelayMinutes(): number {
    const throttleLevel = this.getThrottleLevel();
    
    if (throttleLevel === 0) {
      return 0; // No delay
    }

    // Base delay increases with throttle level
    const baseDelay = throttleLevel * 60; // Up to 60 minutes
    return Math.round(baseDelay);
  }

  /**
   * Check if enough time has passed since last prompt
   */
  canShowPrompt(): boolean {
    if (!this.metrics.lastPromptAt) {
      return true; // No prompts shown yet
    }

    const lastPrompt = new Date(this.metrics.lastPromptAt);
    const now = new Date();
    const minutesSincePrompt = (now.getTime() - lastPrompt.getTime()) / (1000 * 60);
    const requiredDelay = this.getPromptDelayMinutes();

    return minutesSincePrompt >= requiredDelay;
  }

  /**
   * Reset metrics (for testing or user preference change)
   */
  reset(): void {
    this.metrics = {
      totalPromptsShown: 0,
      dismissals: 0,
      acceptances: 0,
      consecutiveDismissals: 0,
    };
  }

  /**
   * Get current metrics (for debugging/analytics)
   */
  getMetrics(): EngagementMetrics {
    return { ...this.metrics };
  }
}

// Global instance
export const engagementThrottle = new EngagementThrottle();
