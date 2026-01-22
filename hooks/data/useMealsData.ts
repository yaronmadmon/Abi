/**
 * Meals Data Hook
 * 
 * Centralized hook for managing meals data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { Meal } from '@/types/home'

export function useMealsData() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load meals
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Meal[]>(STORAGE_KEYS.MEALS)
        setMeals(item?.data || [])
        logger.debug('Meals loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load meals', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save meals
  const saveMeals = useCallback(async (newMeals: Meal[]) => {
    try {
      await storage.set(STORAGE_KEYS.MEALS, newMeals)
      setMeals(newMeals)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('mealsUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save meals', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add meal
  const addMeal = useCallback(async (meal: Meal) => {
    return await saveMeals([...meals, meal])
  }, [meals, saveMeals])

  // Update meal
  const updateMeal = useCallback(async (id: string, updates: Partial<Meal>) => {
    const updated = meals.map(m => m.id === id ? { ...m, ...updates } : m)
    return await saveMeals(updated)
  }, [meals, saveMeals])

  // Delete meal
  const deleteMeal = useCallback(async (id: string) => {
    const filtered = meals.filter(m => m.id !== id)
    return await saveMeals(filtered)
  }, [meals, saveMeals])

  return {
    meals,
    isLoading,
    error,
    saveMeals,
    addMeal,
    updateMeal,
    deleteMeal,
  }
}
