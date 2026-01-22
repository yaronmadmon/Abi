/**
 * Pets Data Hook
 * 
 * Centralized hook for managing pets data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { Pet } from '@/types/home'

export function usePetsData() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load pets
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Pet[]>(STORAGE_KEYS.PETS)
        setPets(item?.data || [])
        logger.debug('Pets loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load pets', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save pets
  const savePets = useCallback(async (newPets: Pet[]) => {
    try {
      await storage.set(STORAGE_KEYS.PETS, newPets)
      setPets(newPets)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('petsUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save pets', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add pet
  const addPet = useCallback(async (pet: Pet) => {
    return await savePets([...pets, pet])
  }, [pets, savePets])

  // Update pet
  const updatePet = useCallback(async (id: string, updates: Partial<Pet>) => {
    const updated = pets.map(p => p.id === id ? { ...p, ...updates } : p)
    return await savePets(updated)
  }, [pets, savePets])

  // Delete pet
  const deletePet = useCallback(async (id: string) => {
    const filtered = pets.filter(p => p.id !== id)
    return await savePets(filtered)
  }, [pets, savePets])

  return {
    pets,
    isLoading,
    error,
    savePets,
    addPet,
    updatePet,
    deletePet,
  }
}
