/**
 * Family Data Hook
 * 
 * Centralized hook for managing family members data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { FamilyMember } from '@/types/home'

export function useFamilyData() {
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load family members
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<FamilyMember[]>(STORAGE_KEYS.FAMILY)
        setFamily(item?.data || [])
        logger.debug('Family members loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load family members', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save family members
  const saveFamily = useCallback(async (newFamily: FamilyMember[]) => {
    try {
      await storage.set(STORAGE_KEYS.FAMILY, newFamily)
      setFamily(newFamily)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('familyUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save family members', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add family member
  const addFamilyMember = useCallback(async (member: FamilyMember) => {
    return await saveFamily([...family, member])
  }, [family, saveFamily])

  // Update family member
  const updateFamilyMember = useCallback(async (id: string, updates: Partial<FamilyMember>) => {
    const updated = family.map(m => m.id === id ? { ...m, ...updates } : m)
    return await saveFamily(updated)
  }, [family, saveFamily])

  // Delete family member
  const deleteFamilyMember = useCallback(async (id: string) => {
    const filtered = family.filter(m => m.id !== id)
    return await saveFamily(filtered)
  }, [family, saveFamily])

  return {
    family,
    isLoading,
    error,
    saveFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
  }
}
