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
import { RECIPE_DATABASE } from "@/data/recipeDatabase";
import { shoppingHandler } from "./shoppingHandler";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

export interface MealPreview {
  preview: Meal;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

/**
 * Convert day name (monday, tuesday, etc.) to date (YYYY-MM-DD)
 */
function dayToDate(day: string): string {
  const dayMap: Record<string, number> = {
    monday: 1, tue: 2, tuesday: 2, wed: 3, wednesday: 3,
    thu: 4, thursday: 4, fri: 5, friday: 5,
    sat: 6, saturday: 6, sun: 0, sunday: 0
  };
  
  const today = new Date();
  const todayDay = today.getDay();
  const dayName = day.toLowerCase().substring(0, 3);
  const targetDay = dayMap[dayName] ?? dayMap[day.toLowerCase()] ?? 1;
  
  let daysToAdd = targetDay - todayDay;
  if (daysToAdd < 0) daysToAdd += 7;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  
  return targetDate.toISOString().split('T')[0];
}

/**
 * Find matching recipe from database
 */
function findMatchingRecipe(mealName: string, mealType: string): any {
  const searchName = mealName.toLowerCase();
  
  // Try exact match first
  let recipe = RECIPE_DATABASE.find(r => 
    r.title.toLowerCase() === searchName && 
    r.mealType === mealType
  );
  
  // Try partial match
  if (!recipe) {
    recipe = RECIPE_DATABASE.find(r => 
      r.title.toLowerCase().includes(searchName) && 
      r.mealType === mealType
    );
  }
  
  // Try any match with same meal type
  if (!recipe) {
    recipe = RECIPE_DATABASE.find(r => r.mealType === mealType);
  }
  
  return recipe;
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
   * Saves to weeklyMeals with full recipe details and auto-adds ingredients to shopping list
   */
  async execute(payload: MealPayload): Promise<any> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    // Load existing weekly meals
    const stored = localStorage.getItem("weeklyMeals");
    const weeklyMeals: any[] = stored ? JSON.parse(stored) : [];

    // Convert day name to date
    const day = payload.day || "monday";
    const date = dayToDate(day);

    // Try to find matching recipe
    const recipe = findMatchingRecipe(payload.name, payload.mealType || "dinner");

    // Create full meal object (matching format from planner)
    const meal: any = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipeId: recipe?.id,
      date,
      mealType: payload.mealType || "dinner",
      title: recipe?.title || payload.name,
      description: recipe?.description || `Delicious ${payload.mealType || "dinner"}`,
      imageUrl: recipe?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      ingredients: recipe?.ingredients || [],
      instructions: recipe?.instructions || [],
      prepTime: recipe?.prepTime || 30,
      tags: recipe?.tags || [],
    };

    // Add to weekly meals
    weeklyMeals.push(meal);
    localStorage.setItem("weeklyMeals", JSON.stringify(weeklyMeals));
    
    // Automatically extract ingredients and add to shopping list
    if (meal.ingredients && meal.ingredients.length > 0) {
      try {
        const ingredientNames = meal.ingredients.map((ing: any) => ing.name.toLowerCase().trim());
        const uniqueIngredients = Array.from(new Set(ingredientNames));
        
        await shoppingHandler.execute({
          items: uniqueIngredients,
          category: "pantry"
        });
        
        logger.info('Ingredients added to shopping list', { count: uniqueIngredients.length });
      } catch (error) {
        logger.warn('Failed to add ingredients to shopping list', error as Error);
        // Don't fail meal creation if shopping list update fails
      }
    }
    
    // Trigger update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mealsUpdated'));
    }
    
    logger.info('Meal created successfully', { mealId: meal.id, name: meal.title, date });
    return meal;
  }

  /**
   * Update an existing meal
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<MealPayload>): Promise<any> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Meal ID is required for update');
    }

    const stored = localStorage.getItem("weeklyMeals");
    const meals: any[] = stored ? JSON.parse(stored) : [];
    
    const mealIndex = meals.findIndex(m => m.id === payload.id);
    if (mealIndex === -1) {
      throw new Error(`Meal with ID ${payload.id} not found`);
    }

    const existingMeal = meals[mealIndex];
    const updatedMeal: any = {
      ...existingMeal,
      ...(payload.name && { title: payload.name }),
      ...(payload.mealType && { mealType: payload.mealType }),
      ...(payload.day && { date: dayToDate(payload.day) }),
    };

    meals[mealIndex] = updatedMeal;
    localStorage.setItem("weeklyMeals", JSON.stringify(meals));
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

    const stored = localStorage.getItem("weeklyMeals");
    const meals: any[] = stored ? JSON.parse(stored) : [];
    
    const mealIndex = meals.findIndex(m => m.id === payload.id);
    if (mealIndex === -1) {
      throw new Error(`Meal with ID ${payload.id} not found`);
    }

    meals.splice(mealIndex, 1);
    localStorage.setItem("weeklyMeals", JSON.stringify(meals));
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
