/**
 * Meals Module Handler
 * Adapter for meals module - wraps existing module logic
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { MealPayload } from "../schemas/intentSchema";
import type { Meal } from "@/types/home";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

export interface MealPreview {
  preview: Meal;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class MealsHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: MealPayload): Promise<void> {
    await this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   */
  async propose(payload: MealPayload): Promise<MealPreview> {
    const validation = this.validate(payload);
    
    const preview: Meal = {
      id: `temp_${Date.now()}`,
      name: payload.name,
      day: payload.day || "monday",
      mealType: payload.mealType || "dinner",
      createdAt: new Date().toISOString(),
    };
    
    const impacts = [
      `Creates 1 meal: "${payload.name}"`,
      `Day: ${payload.day || "monday"}`,
      `Type: ${payload.mealType || "dinner"}`,
    ];
    
    return { preview, validation, impacts };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   */
  async execute(payload: MealPayload): Promise<Meal> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    const stored = localStorage.getItem("meals");
    const meals: Meal[] = stored ? JSON.parse(stored) : [];

    const meal: Meal = {
      id: Date.now().toString(),
      name: payload.name,
      day: payload.day || "monday",
      mealType: payload.mealType || "dinner",
      createdAt: new Date().toISOString(),
    };

    meals.push(meal);
    localStorage.setItem("meals", JSON.stringify(meals));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mealsUpdated'));
    }
    
    logger.info('Meal created successfully', { mealId: meal.id, name: meal.name });
    return meal;
  }

  /**
   * Update an existing meal
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<MealPayload>): Promise<Meal> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Meal ID is required for update');
    }

    const stored = localStorage.getItem("meals");
    const meals: Meal[] = stored ? JSON.parse(stored) : [];
    
    const mealIndex = meals.findIndex(m => m.id === payload.id);
    if (mealIndex === -1) {
      throw new Error(`Meal with ID ${payload.id} not found`);
    }

    const updatedMeal: Meal = {
      ...meals[mealIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.day && { day: payload.day }),
      ...(payload.mealType && { mealType: payload.mealType }),
    };

    meals[mealIndex] = updatedMeal;
    localStorage.setItem("meals", JSON.stringify(meals));
    window.dispatchEvent(new Event('mealsUpdated'));
    
    logger.info('Meal updated successfully', { mealId: updatedMeal.id });
    return updatedMeal;
  }

  /**
   * Delete a meal
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Meal ID is required for delete');
    }

    const stored = localStorage.getItem("meals");
    const meals: Meal[] = stored ? JSON.parse(stored) : [];
    
    const mealIndex = meals.findIndex(m => m.id === payload.id);
    if (mealIndex === -1) {
      throw new Error(`Meal with ID ${payload.id} not found`);
    }

    meals.splice(mealIndex, 1);
    localStorage.setItem("meals", JSON.stringify(meals));
    window.dispatchEvent(new Event('mealsUpdated'));
    
    logger.info('Meal deleted successfully', { mealId: payload.id });
  }

  private validate(payload: MealPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.name || payload.name.trim() === '') {
      errors.push('Meal name is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const mealsHandler = new MealsHandler();
