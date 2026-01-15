/**
 * Emotional Intelligence Types
 * Mood inference, user state, and AI behavior adjustment
 */

export enum UserMood {
  NEUTRAL = 'neutral',
  STRESSED = 'stressed',
  FRUSTRATED = 'frustrated',
  HAPPY = 'happy',
  TIRED = 'tired',
  FOCUSED = 'focused',
  OVERWHELMED = 'overwhelmed',
  CALM = 'calm',
}

export enum UserState {
  PRODUCTIVE = 'productive',
  STRUGGLING = 'struggling',
  OVERWHELMED = 'overwhelmed',
  ORGANIZED = 'organized',
  SCATTERED = 'scattered',
  FOCUSED = 'focused',
}

export enum AITone {
  WARM = 'warm',
  CONCISE = 'concise',
  SUPPORTIVE = 'supportive',
  ENCOURAGING = 'encouraging',
  CALM = 'calm',
  MINIMAL = 'minimal',
}

export enum QuestionType {
  CLARIFYING = 'clarifying',
  CHEER_UP = 'cheer_up',
  REFLECTION = 'reflection',
  FOLLOW_UP = 'follow_up',
}

export interface MoodInference {
  mood: UserMood;
  state: UserState;
  confidence: number; // 0-1
  indicators: string[]; // What led to this inference
  timestamp: string; // ISO 8601
}

export interface UsagePattern {
  averageSessionLength: number; // in minutes
  peakHours: number[]; // Hours of day (0-23) when user is most active
  taskCompletionRate: number; // 0-1
  inputFrequency: number; // inputs per hour
  frictionPoints: string[]; // Common friction points detected
  preferredInteractionStyle: 'detailed' | 'brief' | 'mixed';
}

export interface TaskFriction {
  taskId: string;
  frictionType: 'repeated_edits' | 'abandonment' | 'long_completion_time' | 'complex_input';
  detectedAt: string; // ISO 8601
  details?: Record<string, unknown>;
}

export interface AIBehavior {
  tone: AITone;
  verbosity: 'minimal' | 'brief' | 'normal' | 'detailed';
  timing: 'immediate' | 'delayed' | 'scheduled';
  questionFrequency: 'never' | 'low' | 'normal';
  silenceMode: boolean; // Whether AI should minimize output
}

export interface SmartQuestion {
  id: string;
  type: QuestionType;
  question: string;
  suggestedActions?: string[];
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string; // ISO 8601 - question won't show after this
  context?: Record<string, unknown>;
}

export interface EmotionalContext {
  currentMood: MoodInference | null;
  usagePattern: UsagePattern;
  recentFriction: TaskFriction[];
  aiBehavior: AIBehavior;
  lastInteractionAt?: string; // ISO 8601
}
