/**
 * Meal Schema - Zod Validation
 */

import { z } from 'zod'

export const MealSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  date: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recipe: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
})

export type Meal = z.infer<typeof MealSchema>

export function validateMeal(data: unknown): Meal {
  return MealSchema.parse(data)
}

export function isValidMeal(data: unknown): data is Meal {
  return MealSchema.safeParse(data).success
}

export function validateMeals(data: unknown[]): Meal[] {
  return data.filter((item) => {
    const result = MealSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid meal data:', item, result.error)
    }
    return result.success
  }) as Meal[]
}
