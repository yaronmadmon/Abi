/**
 * Reminders Data Hook
 * 
 * Centralized hook for managing reminders.
 * Note: Reminders are currently stored as tasks with reminder category.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/home'

export function useRemindersData() {
  const [reminders, setReminders] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load reminders (tasks with 'reminder' category)
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Task[]>(STORAGE_KEYS.TASKS)
        const allTasks = item?.data || []
        const reminderTasks = allTasks.filter(t => t.category === 'reminder')
        setReminders(reminderTasks)
        logger.debug('Reminders loaded', { count: reminderTasks.length })
      } catch (err) {
        logger.error('Failed to load reminders', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save reminder (saves to tasks)
  const saveReminder = useCallback(async (reminder: Task) => {
    try {
      const item = await storage.get<Task[]>(STORAGE_KEYS.TASKS)
      const allTasks = item?.data || []
      const updated = [...allTasks, reminder]
      await storage.set(STORAGE_KEYS.TASKS, updated)
      setReminders(updated.filter(t => t.category === 'reminder'))
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tasksUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save reminder', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Update reminder
  const updateReminder = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const item = await storage.get<Task[]>(STORAGE_KEYS.TASKS)
      const allTasks = item?.data || []
      const updated = allTasks.map(t => t.id === id ? { ...t, ...updates } : t)
      await storage.set(STORAGE_KEYS.TASKS, updated)
      setReminders(updated.filter(t => t.category === 'reminder'))
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tasksUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to update reminder', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Delete reminder
  const deleteReminder = useCallback(async (id: string) => {
    try {
      const item = await storage.get<Task[]>(STORAGE_KEYS.TASKS)
      const allTasks = item?.data || []
      const updated = allTasks.filter(t => t.id !== id)
      await storage.set(STORAGE_KEYS.TASKS, updated)
      setReminders(updated.filter(t => t.category === 'reminder'))
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tasksUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to delete reminder', err)
      setError(err as Error)
      return false
    }
  }, [])

  return {
    reminders,
    isLoading,
    error,
    saveReminder,
    updateReminder,
    deleteReminder,
  }
}
