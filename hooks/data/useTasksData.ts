/**
 * Tasks Data Hook
 * 
 * Centralized hook for managing tasks data.
 * Replaces direct localStorage calls throughout the app.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/home'

export function useTasksData() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load tasks on mount
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Task[]>(STORAGE_KEYS.TASKS)
        setTasks(item?.data || [])
        logger.debug('Tasks loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load tasks', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save tasks to storage
  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      await storage.set(STORAGE_KEYS.TASKS, newTasks)
      setTasks(newTasks)
      
      // Trigger update event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tasksUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save tasks', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add a single task
  const addTask = useCallback(async (task: Task) => {
    return await saveTasks([...tasks, task])
  }, [tasks, saveTasks])

  // Update a task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    return await saveTasks(updated)
  }, [tasks, saveTasks])

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    const filtered = tasks.filter(t => t.id !== id)
    return await saveTasks(filtered)
  }, [tasks, saveTasks])

  // Toggle task completion
  const toggleTask = useCallback(async (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    )
    return await saveTasks(updated)
  }, [tasks, saveTasks])

  return {
    tasks,
    isLoading,
    error,
    saveTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  }
}
