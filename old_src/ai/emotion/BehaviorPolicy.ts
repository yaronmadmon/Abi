/**
 * Behavior Policy
 * Maps mood and state to AI behavior (tone, verbosity, engagement)
 * Ensures AI speaks less, not more
 */

import { UserMood, UserState } from '@/types/mood';
import { AIBehavior, AITone } from '@/types/mood';
import { UsagePattern, TaskFriction } from '@/types/mood';

/**
 * Behavior policy that determines AI behavior from mood and context
 * Core principle: Silence is preferred over prompting
 */
export class BehaviorPolicy {
  /**
   * Determine AI behavior from mood and context
   */
  determineBehavior(params: {
    mood: UserMood;
    state: UserState;
    usagePattern: UsagePattern;
    recentFriction: TaskFriction[];
    recentEngagement?: number; // Recent question prompts shown (lower = less engagement)
    dismissals?: number; // User dismissals of prompts
  }): AIBehavior {
    let tone: AITone = AITone.WARM;
    let verbosity: 'minimal' | 'brief' | 'normal' | 'detailed' = 'normal';
    let questionFrequency: 'never' | 'low' | 'normal' = 'low'; // Default to low
    let silenceMode = false;

    // Base behavior from mood
    const moodBehavior = this.getBehaviorFromMood(params.mood);
    tone = moodBehavior.tone;
    verbosity = moodBehavior.verbosity;
    questionFrequency = moodBehavior.questionFrequency;
    silenceMode = moodBehavior.silenceMode;

    // Adjust from state
    const stateBehavior = this.getBehaviorFromState(params.state);
    if (stateBehavior.verbosity === 'minimal' || silenceMode) {
      verbosity = 'minimal';
      silenceMode = true;
      questionFrequency = 'never';
    }

    // Adjust from usage pattern
    if (params.usagePattern.preferredInteractionStyle === 'brief') {
      verbosity = 'brief';
      questionFrequency = 'never';
    }

    // Respect engagement patterns
    // If user dismisses prompts, reduce engagement
    if (params.dismissals && params.dismissals > 2) {
      questionFrequency = 'never';
      silenceMode = true;
      verbosity = 'minimal';
    }

    // If recent engagement is high, reduce further prompts
    if (params.recentEngagement && params.recentEngagement > 3) {
      questionFrequency = Math.max(0, questionFrequency === 'normal' ? 1 : questionFrequency === 'low' ? 0 : 0) as any;
      if (questionFrequency === 0) {
        questionFrequency = 'never';
        silenceMode = true;
      }
    }

    // Reinforce silence for overwhelmed states
    if (params.state === UserState.OVERWHELMED || params.mood === UserMood.OVERWHELMED) {
      silenceMode = true;
      questionFrequency = 'never';
      verbosity = 'minimal';
    }

    // Respect preference for silence
    if (params.usagePattern.preferredInteractionStyle === 'brief' || 
        params.usagePattern.preferredInteractionStyle === 'mixed') {
      // Mixed prefers brief by default, can be overridden by mood
      if (verbosity === 'normal' && params.mood === UserMood.NEUTRAL) {
        verbosity = 'brief';
      }
    }

    return {
      tone,
      verbosity,
      timing: 'immediate', // Always immediate when speaking
      questionFrequency,
      silenceMode,
    };
  }

  /**
   * Get behavior from mood
   */
  private getBehaviorFromMood(mood: UserMood): Partial<AIBehavior> {
    switch (mood) {
      case UserMood.OVERWHELMED:
        return {
          tone: AITone.CALM,
          verbosity: 'minimal',
          questionFrequency: 'never',
          silenceMode: true,
        };
      
      case UserMood.FRUSTRATED:
        return {
          tone: AITone.SUPPORTIVE,
          verbosity: 'brief',
          questionFrequency: 'low',
          silenceMode: false,
        };
      
      case UserMood.TIRED:
        return {
          tone: AITone.MINIMAL,
          verbosity: 'minimal',
          questionFrequency: 'never',
          silenceMode: true,
        };
      
      case UserMood.FOCUSED:
        return {
          tone: AITone.CONCISE,
          verbosity: 'brief',
          questionFrequency: 'never',
          silenceMode: true,
        };
      
      case UserMood.HAPPY:
        return {
          tone: AITone.ENCOURAGING,
          verbosity: 'normal',
          questionFrequency: 'low', // Still keep it low
          silenceMode: false,
        };
      
      default:
        // NEUTRAL - default to minimal engagement
        return {
          tone: AITone.WARM,
          verbosity: 'brief',
          questionFrequency: 'low',
          silenceMode: false,
        };
    }
  }

  /**
   * Get behavior from state
   */
  private getBehaviorFromState(state: UserState): Partial<AIBehavior> {
    switch (state) {
      case UserState.OVERWHELMED:
        return {
          verbosity: 'minimal',
          questionFrequency: 'never',
          silenceMode: true,
        };
      
      case UserState.STRUGGLING:
        return {
          verbosity: 'brief',
          questionFrequency: 'low',
          silenceMode: false,
        };
      
      case UserState.SCATTERED:
        return {
          verbosity: 'brief',
          questionFrequency: 'never',
          silenceMode: false,
        };
      
      case UserState.ORGANIZED:
        return {
          verbosity: 'brief',
          questionFrequency: 'low',
          silenceMode: false,
        };
      
      default:
        return {};
    }
  }

  /**
   * Should AI speak given current behavior?
   */
  shouldSpeak(behavior: AIBehavior, hasNewInfo: boolean): boolean {
    // Silence mode means minimal output
    if (behavior.silenceMode) {
      return hasNewInfo && behavior.verbosity !== 'minimal'; // Only speak for important new info
    }

    // Never ask questions if frequency is never
    if (behavior.questionFrequency === 'never') {
      return hasNewInfo; // Only speak if there's important info
    }

    // Default: speak when there's useful information
    return hasNewInfo;
  }
}
