/**
 * Mood Classifier
 * Advanced mood inference from tone, friction, and postponement patterns
 */

import { UserMood, UserState, MoodInference, UsagePattern, TaskFriction } from '@/types/mood';
import { inferMoodFromText } from '@/utils/mood';

/**
 * Enhanced mood classification using multiple signals
 */
export class MoodClassifier {
  /**
   * Classify mood from multiple signals
   */
  classifyMood(params: {
    inputText?: string;
    usagePattern: UsagePattern;
    recentFriction: TaskFriction[];
    recentPostponements?: number; // Count of postponed tasks
    inputFrequency?: number; // Recent input frequency
    timeOfDay?: number; // Hour of day (0-23)
  }): MoodInference {
    const indicators: string[] = [];
    let mood = UserMood.NEUTRAL;
    let state = UserState.ORGANIZED;
    let confidence = 0.5;

    // Text-based mood (if input provided)
    if (params.inputText) {
      const textMood = inferMoodFromText(params.inputText);
      indicators.push(...textMood.indicators);
      
      // Weight text mood heavily if confidence is high
      if (textMood.confidence > 0.7) {
        mood = textMood.mood;
        state = textMood.state;
        confidence = textMood.confidence;
      }
    }

    // Friction-based indicators
    const frictionSignals = this.analyzeFriction(params.recentFriction);
    if (frictionSignals.mood !== UserMood.NEUTRAL) {
      indicators.push(...frictionSignals.indicators);
      
      // Friction increases confidence of negative moods
      if (frictionSignals.confidence > confidence) {
        mood = frictionSignals.mood;
        state = frictionSignals.state;
        confidence = frictionSignals.confidence;
      }
    }

    // Postponement patterns
    if (params.recentPostponements && params.recentPostponements > 2) {
      indicators.push(`High postponement rate (${params.recentPostponements} recent postponements)`);
      if (mood === UserMood.NEUTRAL) {
        mood = UserMood.OVERWHELMED;
        state = UserState.OVERWHELMED;
        confidence = Math.max(confidence, 0.6);
      }
    }

    // Usage pattern signals
    const patternSignals = this.analyzeUsagePattern(params.usagePattern);
    if (patternSignals.mood !== UserMood.NEUTRAL && patternSignals.confidence > confidence * 0.8) {
      indicators.push(...patternSignals.indicators);
      // Use pattern signals to reinforce mood
      if (patternSignals.mood === mood) {
        confidence = Math.min(1.0, confidence + 0.1);
      }
    }

    // Time-of-day patterns
    const timeSignals = this.analyzeTimeOfDay(params.timeOfDay);
    if (timeSignals) {
      indicators.push(timeSignals);
      // Lower confidence for tired mood during late hours
      if (timeSignals.includes('late') && mood === UserMood.TIRED) {
        confidence = Math.min(1.0, confidence + 0.1);
      }
    }

    return {
      mood,
      state,
      confidence: Math.min(confidence, 1.0),
      indicators,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Analyze friction patterns
   */
  private analyzeFriction(friction: TaskFriction[]): {
    mood: UserMood;
    state: UserState;
    confidence: number;
    indicators: string[];
  } {
    if (friction.length === 0) {
      return {
        mood: UserMood.NEUTRAL,
        state: UserState.ORGANIZED,
        confidence: 0.5,
        indicators: [],
      };
    }

    const indicators: string[] = [];
    const repeatedEdits = friction.filter(f => f.frictionType === 'repeated_edits').length;
    const abandonments = friction.filter(f => f.frictionType === 'abandonment').length;
    const longCompletion = friction.filter(f => f.frictionType === 'long_completion_time').length;

    let mood = UserMood.NEUTRAL;
    let state = UserState.ORGANIZED;
    let confidence = 0.5;

    if (repeatedEdits > 2) {
      indicators.push(`Repeated edits detected (${repeatedEdits} tasks)`);
      mood = UserMood.FRUSTRATED;
      state = UserState.STRUGGLING;
      confidence = 0.7;
    }

    if (abandonments > 1) {
      indicators.push(`Task abandonments detected (${abandonments} tasks)`);
      if (mood === UserMood.NEUTRAL) {
        mood = UserMood.OVERWHELMED;
        state = UserState.OVERWHELMED;
        confidence = 0.65;
      } else {
        confidence = Math.max(confidence, 0.7);
      }
    }

    if (longCompletion > 2) {
      indicators.push(`Tasks taking longer than expected (${longCompletion} tasks)`);
      if (mood === UserMood.NEUTRAL) {
        mood = UserMood.TIRED;
        state = UserState.SCATTERED;
        confidence = 0.6;
      }
    }

    return { mood, state, confidence, indicators };
  }

  /**
   * Analyze usage patterns
   */
  private analyzeUsagePattern(pattern: UsagePattern): {
    mood: UserMood;
    state: UserState;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let mood = UserMood.NEUTRAL;
    let state = UserState.ORGANIZED;
    let confidence = 0.5;

    // Low completion rate suggests struggle
    if (pattern.taskCompletionRate < 0.5) {
      indicators.push(`Low task completion rate (${Math.round(pattern.taskCompletionRate * 100)}%)`);
      mood = UserMood.FRUSTRATED;
      state = UserState.STRUGGLING;
      confidence = 0.7;
    }

    // Many friction points suggest overwhelm
    if (pattern.frictionPoints.length > 3) {
      indicators.push(`Multiple friction points (${pattern.frictionPoints.length})`);
      mood = UserMood.OVERWHELMED;
      state = UserState.OVERWHELMED;
      confidence = Math.max(confidence, 0.65);
    }

    // High input frequency might indicate scattered
    if (pattern.inputFrequency > 10) {
      indicators.push(`High input frequency (${pattern.inputFrequency} per hour)`);
      if (mood === UserMood.NEUTRAL) {
        mood = UserMood.FOCUSED; // Could be very focused OR scattered, context dependent
        state = UserState.SCATTERED;
        confidence = 0.5;
      }
    }

    return { mood, state, confidence, indicators };
  }

  /**
   * Analyze time-of-day patterns
   */
  private analyzeTimeOfDay(timeOfDay?: number): string | null {
    if (timeOfDay === undefined) return null;

    // Late night/early morning
    if (timeOfDay >= 23 || timeOfDay < 6) {
      return 'Late night/early morning activity';
    }

    // Mid-afternoon slump
    if (timeOfDay >= 14 && timeOfDay <= 15) {
      return 'Afternoon activity period';
    }

    return null;
  }
}
