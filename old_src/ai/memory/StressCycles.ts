/**
 * Stress Cycles
 * Track stress cycles (school season, work peaks)
 * Informs behavior, not decisions
 */

import { EntityId } from '@/models';
import { UserMood } from '@/types/mood';

export interface StressCycle {
  id: string;
  householdId: EntityId;
  name: string; // e.g., "school season", "work peak", "holidays"
  type: 'seasonal' | 'recurring' | 'contextual';
  startPattern: string; // Pattern that indicates cycle start
  endPattern?: string; // Pattern that indicates cycle end
  duration: number; // Typical duration in days
  associatedMoods: UserMood[]; // Moods typically observed during cycle
  confidence: number; // 0-1
  firstDetectedAt: string; // ISO 8601
  lastObservedAt: string; // ISO 8601
  occurrenceCount: number;
}

export interface StressCycleObservation {
  cycleId: string;
  startedAt: string; // ISO 8601
  endedAt?: string; // ISO 8601
  peakMood?: UserMood;
  peakIntensity?: number; // 0-1
}

/**
 * Stress Cycles Tracker
 * Tracks recurring stress patterns without labeling the user
 */
export class StressCycles {
  private cycles: StressCycle[] = [];
  private observations: StressCycleObservation[] = [];
  private minOccurrences = 2; // Minimum occurrences to confirm cycle

  /**
   * Detect stress cycle from mood patterns
   */
  detectCycle(params: {
    name: string;
    type: StressCycle['type'];
    moodHistory: Array<{ mood: UserMood; timestamp: string }>;
    context?: string;
  }): StressCycle | null {
    // Analyze mood history for patterns
    const associatedMoods: UserMood[] = [];
    const moodCounts = new Map<UserMood, number>();
    
    params.moodHistory.forEach(item => {
      moodCounts.set(item.mood, (moodCounts.get(item.mood) || 0) + 1);
    });
    
    // Find most common moods (indicating stress)
    moodCounts.forEach((count, mood) => {
      if (mood === UserMood.OVERWHELMED || mood === UserMood.STRESSED || mood === UserMood.FRUSTRATED) {
        associatedMoods.push(mood);
      }
    });

    if (associatedMoods.length === 0) {
      return null; // No stress indicators
    }

    // Check if cycle already exists
    const existing = this.cycles.find(c => c.name === params.name && c.type === params.type);
    
    if (existing) {
      existing.occurrenceCount += 1;
      existing.lastObservedAt = new Date().toISOString();
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      return existing;
    }

    // Calculate duration from history
    if (params.moodHistory.length < 2) return null;
    
    const firstMood = params.moodHistory[0];
    const lastMood = params.moodHistory[params.moodHistory.length - 1];
    const start = new Date(firstMood.timestamp);
    const end = new Date(lastMood.timestamp);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const cycle: StressCycle = {
      id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      householdId: 'household-1', // Would come from context
      name: params.name,
      type: params.type,
      startPattern: params.context || 'Pattern detected',
      duration,
      associatedMoods,
      confidence: 0.6, // Start with medium confidence
      firstDetectedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      occurrenceCount: 1,
    };

    this.cycles.push(cycle);
    return cycle;
  }

  /**
   * Check if currently in a stress cycle
   */
  isInStressCycle(now: Date = new Date()): StressCycle | null {
    return this.cycles.find(cycle => {
      // Simplified check - would be more sophisticated in production
      // Would check against calendar, context, etc.
      return cycle.confidence >= 0.7 && cycle.occurrenceCount >= this.minOccurrences;
    }) || null;
  }

  /**
   * Get active stress cycle
   */
  getActiveCycle(): StressCycle | null {
    return this.isInStressCycle();
  }

  /**
   * Record cycle observation
   */
  recordObservation(observation: StressCycleObservation): void {
    this.observations.push(observation);
    
    // Update cycle confidence
    const cycle = this.cycles.find(c => c.id === observation.cycleId);
    if (cycle) {
      cycle.occurrenceCount += 1;
      cycle.lastObservedAt = observation.startedAt;
      if (observation.peakMood) {
        if (!cycle.associatedMoods.includes(observation.peakMood)) {
          cycle.associatedMoods.push(observation.peakMood);
        }
      }
    }
  }

  /**
   * Get all cycles
   */
  getAllCycles(): StressCycle[] {
    return [...this.cycles];
  }

  /**
   * Get cycles by type
   */
  getCyclesByType(type: StressCycle['type']): StressCycle[] {
    return this.cycles.filter(c => c.type === type);
  }
}

// Global instance
export const stressCycles = new StressCycles();
