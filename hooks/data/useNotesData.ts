/**
 * Notes Data Hook
 * 
 * Centralized hook for managing notes data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'

export interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  isPinned?: boolean
}

export function useNotesData() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load notes
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Note[]>(STORAGE_KEYS.NOTES)
        setNotes(item?.data || [])
        logger.debug('Notes loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load notes', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save notes
  const saveNotes = useCallback(async (newNotes: Note[]) => {
    try {
      await storage.set(STORAGE_KEYS.NOTES, newNotes)
      setNotes(newNotes)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notesUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save notes', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add note
  const addNote = useCallback(async (note: Note) => {
    return await saveNotes([...notes, note])
  }, [notes, saveNotes])

  // Update note
  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const updated = notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    )
    return await saveNotes(updated)
  }, [notes, saveNotes])

  // Delete note
  const deleteNote = useCallback(async (id: string) => {
    const filtered = notes.filter(n => n.id !== id)
    return await saveNotes(filtered)
  }, [notes, saveNotes])

  // Toggle pin
  const togglePin = useCallback(async (id: string) => {
    const updated = notes.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    )
    return await saveNotes(updated)
  }, [notes, saveNotes])

  return {
    notes,
    isLoading,
    error,
    saveNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
  }
}
