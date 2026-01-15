/**
 * Meals Module Handler
 * Adapter for meals module - wraps existing module logic
 */

import type { MealPayload } from "../schemas/intentSchema";
import type { Meal } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

class MealsHandler implements ModuleHandler {
  async create(payload: MealPayload): Promise<void> {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    // Load existing meals
    const stored = localStorage.getItem("meals");
    const meals: Meal[] = stored ? JSON.parse(stored) : [];

    // Create new meal
    const meal: Meal = {
      id: Date.now().toString(),
      name: payload.name,
      day: payload.day || "monday",
      mealType: payload.mealType || "dinner",
      createdAt: new Date().toISOString(),
    };

    // Save meals
    meals.push(meal);
    localStorage.setItem("meals", JSON.stringify(meals));
  }
}

export const mealsHandler = new MealsHandler();
