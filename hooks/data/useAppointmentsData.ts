/**
 * Appointments Data Hook
 * 
 * Centralized hook for managing appointments data.
 */

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { logger } from '@/lib/logger'

export interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  forWho?: string
  createdAt?: string
}

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load appointments
  useEffect(() => {
    async function load() {
      try {
        const item = await storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS)
        setAppointments(item?.data || [])
        logger.debug('Appointments loaded', { count: item?.data?.length || 0 })
      } catch (err) {
        logger.error('Failed to load appointments', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Save appointments
  const saveAppointments = useCallback(async (newAppointments: Appointment[]) => {
    try {
      await storage.set(STORAGE_KEYS.APPOINTMENTS, newAppointments)
      setAppointments(newAppointments)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('appointmentsUpdated'))
      }
      
      return true
    } catch (err) {
      logger.error('Failed to save appointments', err)
      setError(err as Error)
      return false
    }
  }, [])

  // Add appointment
  const addAppointment = useCallback(async (appointment: Appointment) => {
    return await saveAppointments([...appointments, appointment])
  }, [appointments, saveAppointments])

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    const updated = appointments.map(a => a.id === id ? { ...a, ...updates } : a)
    return await saveAppointments(updated)
  }, [appointments, saveAppointments])

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    const filtered = appointments.filter(a => a.id !== id)
    return await saveAppointments(filtered)
  }, [appointments, saveAppointments])

  return {
    appointments,
    isLoading,
    error,
    saveAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  }
}
