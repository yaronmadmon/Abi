/**
 * Mood Inference Utilities
 * Infer user state from tone, usage patterns, and task friction
 */

import {
  UserMood,
  UserState,
  AITone,
  MoodInference,
  UsagePattern,
  TaskFriction,
  AIBehavior,
  SmartQuestion,
  QuestionType,
} from '@/types/mood';

/**
 * Infer mood from input text tone
 */
export function inferMoodFromText(text: string): MoodInference {
  const textLower = text.toLowerCase();
  const indicators: string[] = [];
  let mood = UserMood.NEUTRAL;
  let state = UserState.ORGANIZED;
  let confidence = 0.5;

  // Stress indicators
  const stressKeywords = ['urgent', 'asap', 'hurry', 'stress', 'overwhelmed', 'too much', 'can\'t', 'impossible'];
  const stressCount = stressKeywords.filter(kw => textLower.includes(kw)).length;
  
  // Frustration indicators
  const frustrationKeywords = ['why', 'again', 'still', 'another', 'annoying', 'hate', 'sick of'];
  const frustrationCount = frustrationKeywords.filter(kw => textLower.includes(kw)).length;
  
  // Positive indicators
  const positiveKeywords = ['great', 'love', 'awesome', 'excited', 'happy', 'wonderful', 'thanks', 'thank you'];
  const positiveCount = positiveKeywords.filter(kw => textLower.includes(kw)).length;
  
  // Tired indicators
  const tiredKeywords = ['tired', 'exhausted', 'sleep', 'late', 'done', 'enough'];
  const tiredCount = tiredKeywords.filter(kw => textLower.includes(kw)).length;
  
  // Overwhelmed indicators
  const overwhelmedKeywords = ['too many', 'lot', 'everything', 'all', 'both', 'and', 'also'];
  const overwhelmedCount = overwhelmedKeywords.filter(kw => textLower.includes(kw)).length;

  // Determine mood
  if (stressCount >= 2 || overwhelmedCount >= 3) {
    mood = UserMood.OVERWHELMED;
    state = UserState.OVERWHELMED;
    confidence = 0.7;
    indicators.push('Stress/overwhelm keywords detected');
  } else if (frustrationCount >= 2) {
    mood = UserMood.FRUSTRATED;
    state = UserState.STRUGGLING;
    confidence = 0.65;
    indicators.push('Frustration keywords detected');
  } else if (positiveCount >= 2) {
    mood = UserMood.HAPPY;
    state = UserState.PRODUCTIVE;
    confidence = 0.7;
    indicators.push('Positive keywords detected');
  } else if (tiredCount >= 2) {
    mood = UserMood.TIRED;
    state = UserState.SCATTERED;
    confidence = 0.6;
    indicators.push('Tired keywords detected');
  } else if (text.length > 200 && text.split(/\s+/).length > 50) {
    // Long input might indicate overwhelmed
    mood = UserMood.OVERWHELMED;
    state = UserState.OVERWHELMED;
    confidence = 0.5;
    indicators.push('Long input detected');
  } else {
    mood = UserMood.NEUTRAL;
    state = UserState.ORGANIZED;
    confidence = 0.5;
  }

  return {
    mood,
    state,
    confidence,
    indicators,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Infer state from usage patterns
 */
export function inferStateFromUsage(usagePattern: UsagePattern): UserState {
  // Low completion rate suggests struggling
  if (usagePattern.taskCompletionRate < 0.5) {
    return UserState.STRUGGLING;
  }
  
  // Many friction points suggests overwhelmed
  if (usagePattern.frictionPoints.length > 3) {
    return UserState.OVERWHELMED;
  }
  
  // High completion rate and low friction suggests organized
  if (usagePattern.taskCompletionRate > 0.8 && usagePattern.frictionPoints.length <= 1) {
    return UserState.ORGANIZED;
  }
  
  // High input frequency might indicate scattered
  if (usagePattern.inputFrequency > 10) {
    return UserState.SCATTERED;
  }
  
  return UserState.PRODUCTIVE;
}

/**
 * Detect task friction
 */
export function detectTaskFriction(
  taskId: string,
  history: Array<{ action: string; timestamp: string }>
): TaskFriction | null {
  // Check for repeated edits
  const edits = history.filter(h => h.action === 'edit');
  if (edits.length > 3) {
    return {
      taskId,
      frictionType: 'repeated_edits',
      detectedAt: new Date().toISOString(),
      details: { editCount: edits.length },
    };
  }
  
  // Check for abandonment (created but not completed)
  const created = history.find(h => h.action === 'create');
  const completed = history.find(h => h.action === 'complete');
  if (created && !completed) {
    const createdTime = new Date(created.timestamp);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 48) {
      return {
        taskId,
        frictionType: 'abandonment',
        detectedAt: new Date().toISOString(),
        details: { hoursSinceCreation },
      };
    }
  }
  
  return null;
}

/**
 * Determine appropriate AI behavior based on mood and state
 */
export function determineAIBehavior(
  mood: MoodInference | null,
  usagePattern: UsagePattern,
  recentFriction: TaskFriction[]
): AIBehavior {
  let tone: AITone = AITone.WARM;
  let verbosity: 'minimal' | 'brief' | 'normal' | 'detailed' = 'normal';
  let timing: 'immediate' | 'delayed' | 'scheduled' = 'immediate';
  let questionFrequency: 'never' | 'low' | 'normal' = 'normal';
  let silenceMode = false;

  if (!mood) {
    // Default behavior when no mood detected
    return {
      tone: AITone.WARM,
      verbosity: 'normal',
      timing: 'immediate',
      questionFrequency: 'low',
      silenceMode: false,
    };
  }

  // Adjust based on mood
  switch (mood.mood) {
    case UserMood.OVERWHELMED:
      tone = AITone.CALM;
      verbosity = 'minimal';
      questionFrequency = 'never';
      silenceMode = true;
      break;
    
    case UserMood.FRUSTRATED:
      tone = AITone.SUPPORTIVE;
      verbosity = 'brief';
      questionFrequency = 'low';
      break;
    
    case UserMood.TIRED:
      tone = AITone.MINIMAL;
      verbosity = 'minimal';
      questionFrequency = 'never';
      silenceMode = true;
      break;
    
    case UserMood.HAPPY:
      tone = AITone.ENCOURAGING;
      verbosity = 'normal';
      questionFrequency = 'normal';
      break;
    
    case UserMood.FOCUSED:
      tone = AITone.CONCISE;
      verbosity = 'brief';
      questionFrequency = 'never';
      silenceMode = true;
      break;
    
    default:
      // Neutral - normal behavior
      break;
  }

  // Adjust based on state
  switch (mood.state) {
    case UserState.OVERWHELMED:
      verbosity = 'minimal';
      questionFrequency = 'never';
      silenceMode = true;
      break;
    
    case UserState.STRUGGLING:
      tone = AITone.SUPPORTIVE;
      verbosity = 'brief';
      break;
    
    case UserState.SCATTERED:
      verbosity = 'brief';
      questionFrequency = 'low';
      break;
    
    case UserState.ORGANIZED:
      tone = AITone.CONCISE;
      verbosity = 'brief';
      break;
  }

  // Adjust based on usage pattern preference
  if (usagePattern.preferredInteractionStyle === 'brief') {
    verbosity = 'brief';
    questionFrequency = 'low';
  } else if (usagePattern.preferredInteractionStyle === 'detailed') {
    verbosity = 'normal';
  }

  // Recent friction increases supportiveness
  if (recentFriction.length > 2) {
    tone = AITone.SUPPORTIVE;
    verbosity = 'brief';
  }

  return {
    tone,
    verbosity,
    timing,
    questionFrequency,
    silenceMode,
  };
}

/**
 * Generate smart questions based on context
 */
export function generateSmartQuestions(
  mood: MoodInference | null,
  usagePattern: UsagePattern,
  recentFriction: TaskFriction[],
  aiBehavior: AIBehavior
): SmartQuestion[] {
  const questions: SmartQuestion[] = [];

  // Silence mode means no questions
  if (aiBehavior.silenceMode || aiBehavior.questionFrequency === 'never') {
    return [];
  }

  // Low frequency means only high-priority questions
  if (aiBehavior.questionFrequency === 'low') {
    // Only generate critical questions
    if (mood && mood.mood === UserMood.OVERWHELMED && recentFriction.length > 3) {
      questions.push({
        id: `q-${Date.now()}-1`,
        type: QuestionType.CHEER_UP,
        question: 'Would you like me to help break things down into smaller steps?',
        priority: 'high',
        context: { mood: mood.mood },
      });
    }
    return questions;
  }

  // Normal frequency - generate contextual questions

  // Cheer-up questions for negative moods
  if (mood && (mood.mood === UserMood.FRUSTRATED || mood.mood === UserMood.STRESSED)) {
    questions.push({
      id: `q-${Date.now()}-2`,
      type: QuestionType.CHEER_UP,
      question: 'Is there anything specific I can help make easier?',
      priority: 'medium',
      context: { mood: mood.mood },
    });
  }

  // Clarifying questions when state is unclear
  if (mood && mood.confidence < 0.6) {
    questions.push({
      id: `q-${Date.now()}-3`,
      type: QuestionType.CLARIFYING,
      question: 'Would you like me to help organize this?',
      priority: 'low',
      context: { confidence: mood.confidence },
    });
  }

  // Reflection questions (very low frequency)
  // Only ask reflection questions rarely (random chance)
  if (Math.random() < 0.1 && mood && mood.state === UserState.ORGANIZED) {
    questions.push({
      id: `q-${Date.now()}-4`,
      type: QuestionType.REFLECTION,
      question: 'How are things working for you? Any adjustments you\'d like?',
      priority: 'low',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24h
      context: { state: mood.state },
    });
  }

  // Follow-up questions based on friction
  if (recentFriction.length > 0 && recentFriction.length <= 2) {
    questions.push({
      id: `q-${Date.now()}-5`,
      type: QuestionType.FOLLOW_UP,
      question: 'I noticed some tasks needed extra attention. Want to review together?',
      priority: 'medium',
      context: { frictionCount: recentFriction.length },
    });
  }

  return questions;
}

/**
 * Format message based on AI behavior
 */
export function formatMessage(message: string, behavior: AIBehavior): string {
  let formatted = message;

  // Adjust verbosity
  if (behavior.verbosity === 'minimal') {
    // Keep only essential information
    const sentences = formatted.split(/[.!?]+/).filter(s => s.trim());
    formatted = sentences.slice(0, 1).join('.') + '.';
  } else if (behavior.verbosity === 'brief') {
    const sentences = formatted.split(/[.!?]+/).filter(s => s.trim());
    formatted = sentences.slice(0, 2).join('.') + '.';
  }

  // Adjust tone
  switch (behavior.tone) {
    case AITone.CALM:
      // Remove urgency words
      formatted = formatted.replace(/\b(urgent|asap|quickly|hurry)\b/gi, '');
      break;
    
    case AITone.MINIMAL:
      // Very short, essential only
      formatted = formatted.split(' ').slice(0, 10).join(' ');
      break;
    
    case AITone.CONCISE:
      // Remove filler words
      formatted = formatted.replace(/\b(just|really|quite|very|pretty)\b/gi, '');
      break;
  }

  return formatted.trim();
}

/**
 * Check if AI should speak (silence rules)
 */
export function shouldAISpeak(
  context: {
    lastInteractionAt?: string;
    mood: MoodInference | null;
    aiBehavior: AIBehavior;
    hasNewInfo: boolean;
  }
): boolean {
  // Silence mode means minimal output
  if (context.aiBehavior.silenceMode) {
    return context.hasNewInfo; // Only speak if there's important new info
  }

  // If user is focused, be quiet
  if (context.mood && context.mood.mood === UserMood.FOCUSED) {
    return false;
  }

  // If recently interacted, allow normal interaction
  if (context.lastInteractionAt) {
    const lastInteraction = new Date(context.lastInteractionAt);
    const now = new Date();
    const minutesSince = (now.getTime() - lastInteraction.getTime()) / (1000 * 60);
    
    // If interacted within last 5 minutes, allow speaking
    if (minutesSince < 5) {
      return true;
    }
  }

  // Default: speak when there's something useful to say
  return context.hasNewInfo;
}

/**
 * Generate encouragement prompt
 */
export function generateEncouragement(mood: MoodInference | null): string | null {
  if (!mood) return null;

  switch (mood.mood) {
    case UserMood.FRUSTRATED:
      return 'You\'re making progress, even if it doesn\'t feel like it.';
    
    case UserMood.OVERWHELMED:
      return 'One thing at a time. You\'ve got this.';
    
    case UserMood.TIRED:
      return 'Rest is productive too. Take care of yourself.';
    
    case UserMood.STRESSED:
      return 'Breathe. You\'re handling a lot right now.';
    
    default:
      return null;
  }
}
