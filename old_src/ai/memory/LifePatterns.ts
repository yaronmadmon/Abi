/**
 * Life Patterns
 * Detect recurring patterns over time (e.g., "Mondays are heavy")
 * Read-only for AI behavior adjustment, not for decisions
 */

import { EntityId } from '@/models';

export interface LifePattern {
  id: string;
  householdId: EntityId;
  patternType: 'temporal' | 'contextual' | 'behavioral';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'irregular';
  confidence: number; // 0-1
  detectedAt: string; // ISO 8601
  lastObservedAt: string; // ISO 8601
  observationCount: number;
  examples: string[];
}

export type TemporalPattern = {
  type: 'temporal';
  timeOfDay?: number[]; // Hours (0-23)
  dayOfWeek?: number[]; // Days (0-6, Sunday-Saturday)
  dayOfMonth?: number[]; // Days (1-31)
  month?: number[]; // Months (1-12)
  season?: string[]; // Seasons
};

export type ContextualPattern = {
  type: 'contextual';
  context: string; // e.g., "school season", "work project"
  conditions: Record<string, unknown>;
};

export type BehavioralPattern = {
  type: 'behavioral';
  behavior: string; // e.g., "likes silence in mornings", "prefers brief responses"
  conditions: Record<string, unknown>;
};

/**
 * Life Patterns Detector
 * Identifies recurring patterns in user behavior
 */
export class LifePatterns {
  private patterns: LifePattern[] = [];
  private minObservations = 3; // Minimum observations to confirm pattern
  private minConfidence = 0.6; // Minimum confidence to record pattern

  /**
   * Detect temporal patterns from task/event history
   */
  detectTemporalPatterns(history: Array<{
    timestamp: string;
    type: string;
    metadata?: Record<string, unknown>;
  }>): LifePattern[] {
    const patterns: LifePattern[] = [];
    
    // Group by day of week
    const byDayOfWeek = new Map<number, number>();
    const byTimeOfDay = new Map<number, number>();
    
    history.forEach(item => {
      const date = new Date(item.timestamp);
      const dayOfWeek = date.getDay();
      const hourOfDay = date.getHours();
      
      byDayOfWeek.set(dayOfWeek, (byDayOfWeek.get(dayOfWeek) || 0) + 1);
      byTimeOfDay.set(hourOfDay, (byTimeOfDay.get(hourOfDay) || 0) + 1);
    });
    
    // Detect day-of-week patterns
    byDayOfWeek.forEach((count, dayOfWeek) => {
      const totalDays = history.length;
      const frequency = count / totalDays;
      
      if (frequency > 0.3 && count >= this.minObservations) {
        // Significant pattern
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const pattern: LifePattern = {
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          householdId: 'household-1', // Would come from context
          patternType: 'temporal',
          description: `${dayNames[dayOfWeek]}s show higher activity`,
          frequency: 'weekly',
          confidence: Math.min(frequency, 1.0),
          detectedAt: new Date().toISOString(),
          lastObservedAt: new Date().toISOString(),
          observationCount: count,
          examples: [`Activity observed on ${dayNames[dayOfWeek]}s`],
        };
        
        if (pattern.confidence >= this.minConfidence) {
          patterns.push(pattern);
        }
      }
    });
    
    // Detect time-of-day patterns
    const peakHours: number[] = [];
    byTimeOfDay.forEach((count, hour) => {
      const totalItems = history.length;
      const frequency = count / totalItems;
      
      if (frequency > 0.2 && count >= this.minObservations) {
        peakHours.push(hour);
      }
    });
    
    if (peakHours.length > 0) {
      const pattern: LifePattern = {
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        householdId: 'household-1',
        patternType: 'temporal',
        description: `Peak activity hours: ${peakHours.join(', ')}`,
        frequency: 'daily',
        confidence: 0.7,
        detectedAt: new Date().toISOString(),
        lastObservedAt: new Date().toISOString(),
        observationCount: peakHours.reduce((sum, h) => sum + (byTimeOfDay.get(h) || 0), 0),
        examples: ['Activity patterns show peak times'],
      };
      
      patterns.push(pattern);
    }
    
    return patterns;
  }

  /**
   * Get patterns matching context
   */
  getPatternsForContext(context: {
    timeOfDay?: number;
    dayOfWeek?: number;
    month?: number;
  }): LifePattern[] {
    return this.patterns.filter(pattern => {
      // This would match against pattern details
      // Simplified for now
      return true;
    });
  }

  /**
   * Add detected pattern
   */
  addPattern(pattern: LifePattern): void {
    // Check if similar pattern exists
    const existing = this.patterns.find(p => 
      p.patternType === pattern.patternType &&
      p.description === pattern.description
    );
    
    if (existing) {
      // Update existing pattern
      existing.observationCount += pattern.observationCount;
      existing.lastObservedAt = pattern.lastObservedAt;
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
    } else {
      this.patterns.push(pattern);
    }
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): LifePattern[] {
    return [...this.patterns];
  }
}

// Global instance
export const lifePatterns = new LifePatterns();
