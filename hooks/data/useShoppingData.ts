/**
 * Shopping Data Hook
 * 
 * Centralized hook for managing shopping list data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { ShoppingItem } from '@/types/home'

export function useShoppingData() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load shopping items
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<ShoppingItem[]>(STORAGE_KEYS.SHOPPING)
        setItems(item?.data || [])
        logger.debug('Shopping items loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load shopping items', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save items
  const saveItems = useCallback(async (newItems: ShoppingItem[]) => {
    try {
      await storage.set(STORAGE_KEYS.SHOPPING, newItems)
      setItems(newItems)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('shoppingUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save shopping items', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add item
  const addItem = useCallback(async (item: ShoppingItem) => {
    return await saveItems([...items, item])
  }, [items, saveItems])

  // Add multiple items
  const addItems = useCallback(async (newItems: ShoppingItem[]) => {
    return await saveItems([...items, ...newItems])
  }, [items, saveItems])

  // Update item
  const updateItem = useCallback(async (id: string, updates: Partial<ShoppingItem>) => {
    const updated = items.map(i => i.id === id ? { ...i, ...updates } : i)
    return await saveItems(updated)
  }, [items, saveItems])

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    const filtered = items.filter(i => i.id !== id)
    return await saveItems(filtered)
  }, [items, saveItems])

  // Toggle checked
  const toggleItem = useCallback(async (id: string) => {
    const updated = items.map(i => 
      i.id === id ? { ...i, checked: !i.checked } : i
    )
    return await saveItems(updated)
  }, [items, saveItems])

  // Clear checked items
  const clearChecked = useCallback(async () => {
    const unchecked = items.filter(i => !i.checked)
    return await saveItems(unchecked)
  }, [items, saveItems])

  return {
    items,
    isLoading,
    error,
    saveItems,
    addItem,
    addItems,
    updateItem,
    deleteItem,
    toggleItem,
    clearChecked,
  }
}
