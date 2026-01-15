/**
 * Emotional Context Provider
 * Manages mood inference and AI behavior adjustment
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  MoodInference,
  UsagePattern,
  TaskFriction,
  AIBehavior,
  SmartQuestion,
  EmotionalContext as EmotionalContextType,
} from '@/types/mood';
import {
  inferMoodFromText,
  determineAIBehavior,
  generateSmartQuestions,
  shouldAISpeak,
  formatMessage,
} from '@/utils/mood';

interface EmotionalContextValue {
  currentMood: MoodInference | null;
  usagePattern: UsagePattern;
  recentFriction: TaskFriction[];
  aiBehavior: AIBehavior;
  smartQuestions: SmartQuestion[];
  updateMoodFromInput: (text: string) => void;
  addFriction: (friction: TaskFriction) => void;
  shouldSpeak: (hasNewInfo: boolean) => boolean;
  formatAIMessage: (message: string) => string;
  dismissQuestion: (questionId: string) => void;
}

const EmotionalContext = createContext<EmotionalContextValue | undefined>(undefined);

const defaultUsagePattern: UsagePattern = {
  averageSessionLength: 15,
  peakHours: [9, 10, 11, 14, 15, 16],
  taskCompletionRate: 0.7,
  inputFrequency: 5,
  frictionPoints: [],
  preferredInteractionStyle: 'mixed',
};

export function EmotionalContextProvider({ children }: { children: React.ReactNode }) {
  const [currentMood, setCurrentMood] = useState<MoodInference | null>(null);
  const [usagePattern] = useState<UsagePattern>(defaultUsagePattern);
  const [recentFriction, setRecentFriction] = useState<TaskFriction[]>([]);
  const [aiBehavior, setAIBehavior] = useState<AIBehavior>({
    tone: 'warm',
    verbosity: 'normal',
    timing: 'immediate',
    questionFrequency: 'low',
    silenceMode: false,
  });
  const [smartQuestions, setSmartQuestions] = useState<SmartQuestion[]>([]);
  const [lastInteractionAt, setLastInteractionAt] = useState<string | undefined>();

  // Update mood from text input
  const updateMoodFromInput = useCallback((text: string) => {
    const mood = inferMoodFromText(text);
    setCurrentMood(mood);
    setLastInteractionAt(new Date().toISOString());

    // Update AI behavior based on new mood
    const newBehavior = determineAIBehavior(mood, usagePattern, recentFriction);
    setAIBehavior(newBehavior);

    // Generate smart questions
    const questions = generateSmartQuestions(mood, usagePattern, recentFriction, newBehavior);
    setSmartQuestions(questions);
  }, [usagePattern, recentFriction]);

  // Add friction point
  const addFriction = useCallback((friction: TaskFriction) => {
    setRecentFriction(prev => {
      const updated = [friction, ...prev].slice(0, 10); // Keep last 10
      
      // Update AI behavior
      const newBehavior = determineAIBehavior(currentMood, usagePattern, updated);
      setAIBehavior(newBehavior);

      return updated;
    });
  }, [currentMood, usagePattern]);

  // Check if AI should speak
  const shouldSpeak = useCallback((hasNewInfo: boolean) => {
    return shouldAISpeak({
      lastInteractionAt,
      mood: currentMood,
      aiBehavior,
      hasNewInfo,
    });
  }, [lastInteractionAt, currentMood, aiBehavior]);

  // Format AI message according to behavior
  const formatAIMessage = useCallback((message: string) => {
    return formatMessage(message, aiBehavior);
  }, [aiBehavior]);

  // Dismiss a question
  const dismissQuestion = useCallback((questionId: string) => {
    setSmartQuestions(prev => prev.filter(q => q.id !== questionId));
  }, []);

  // Update behavior when mood or friction changes
  useEffect(() => {
    const newBehavior = determineAIBehavior(currentMood, usagePattern, recentFriction);
    setAIBehavior(newBehavior);
  }, [currentMood, usagePattern, recentFriction]);

  // Regenerate questions periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const questions = generateSmartQuestions(currentMood, usagePattern, recentFriction, aiBehavior);
      // Filter out expired questions
      const now = new Date();
      const activeQuestions = questions.filter(q => {
        if (q.expiresAt) {
          return new Date(q.expiresAt) > now;
        }
        return true;
      });
      setSmartQuestions(activeQuestions);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentMood, usagePattern, recentFriction, aiBehavior]);

  const value: EmotionalContextValue = {
    currentMood,
    usagePattern,
    recentFriction,
    aiBehavior,
    smartQuestions,
    updateMoodFromInput,
    addFriction,
    shouldSpeak,
    formatAIMessage,
    dismissQuestion,
  };

  return (
    <EmotionalContext.Provider value={value}>
      {children}
    </EmotionalContext.Provider>
  );
}

export function useEmotionalContext() {
  const context = useContext(EmotionalContext);
  if (context === undefined) {
    throw new Error('useEmotionalContext must be used within EmotionalContextProvider');
  }
  return context;
}
