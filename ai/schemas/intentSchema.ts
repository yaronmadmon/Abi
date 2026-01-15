/**
 * Core Intent Schema - NEVER CHANGE THIS
 * This is the strict output contract for all AI interpretation
 */

export type IntentType =
  | "task"
  | "meal"
  | "shopping"
  | "reminder"
  | "appointment"
  | "family"
  | "pet"
  | "clarification"
  | "unknown";

export interface AIIntent {
  type: IntentType;
  confidence: number; // 0-1
  raw: string;
  payload?: any;
  followUpQuestion?: string;
}

/**
 * Payload interfaces for each intent type
 */
export interface TaskPayload {
  title: string;
  category: "cleaning" | "errands" | "kids" | "home-maintenance" | "other";
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface MealPayload {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  day?: string; // "monday" | "tuesday" | etc.
  dietaryNotes?: string;
}

export interface ShoppingPayload {
  items: string[];
  category?: "produce" | "dairy" | "meat" | "cleaning" | "pantry" | "other";
}

export interface ReminderPayload {
  title: string;
  time?: string;
  date?: string;
}

export interface AppointmentPayload {
  title: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface FamilyPayload {
  name: string;
  relationship?: string;
  age?: number;
  notes?: string;
}

export interface PetPayload {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  notes?: string;
}
