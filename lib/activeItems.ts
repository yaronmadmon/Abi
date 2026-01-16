/**
 * Shared utility for getting active/upcoming items across the system
 * Used by Calendar and Cards to stay in sync
 */

import type { Task } from '@/types/home'

export interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  forWho?: string
  createdAt: string
}

export interface ActiveItem {
  id: string
  title: string
  type: 'task' | 'appointment' | 'reminder'
  date?: string
  time?: string
  isOverdue: boolean
  isDueToday: boolean
  isUpcoming: boolean
}

/**
 * Get all active items (upcoming, due today, overdue)
 */
export function getActiveItems(): ActiveItem[] {
  const activeItems: ActiveItem[] = []
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  try {
    // Get tasks (including reminders)
    const tasksStr = localStorage.getItem('tasks')
    if (tasksStr) {
      const tasks: Task[] = JSON.parse(tasksStr)
      tasks.forEach((task) => {
        if (!task.completed && task.dueDate) {
          const isOverdue = task.dueDate < today
          const isDueToday = task.dueDate === today
          const isUpcoming = task.dueDate === tomorrowStr || (task.dueDate > today && !isDueToday)

          if (isOverdue || isDueToday || isUpcoming) {
            const isReminder = task.id.startsWith('reminder-')
            activeItems.push({
              id: task.id,
              title: task.title,
              type: isReminder ? 'reminder' : 'task',
              date: task.dueDate,
              isOverdue,
              isDueToday,
              isUpcoming,
            })
          }
        }
      })
    }

    // Get appointments
    const appointmentsStr = localStorage.getItem('appointments')
    if (appointmentsStr) {
      const appointments: Appointment[] = JSON.parse(appointmentsStr)
      appointments.forEach((apt) => {
        if (apt.date) {
          const isOverdue = apt.date < today
          const isDueToday = apt.date === today
          const isUpcoming = apt.date === tomorrowStr || (apt.date > today && !isDueToday)

          if (isOverdue || isDueToday || isUpcoming) {
            activeItems.push({
              id: apt.id,
              title: apt.title,
              type: 'appointment',
              date: apt.date,
              time: apt.time,
              isOverdue,
              isDueToday,
              isUpcoming,
            })
          }
        }
      })
    }
  } catch (error) {
    console.error('Error getting active items:', error)
  }

  return activeItems
}

/**
 * Get count of active items by type
 */
export function getActiveItemCounts() {
  const activeItems = getActiveItems()
  return {
    total: activeItems.length,
    overdue: activeItems.filter((item) => item.isOverdue).length,
    dueToday: activeItems.filter((item) => item.isDueToday).length,
    upcoming: activeItems.filter((item) => item.isUpcoming).length,
    tasks: activeItems.filter((item) => item.type === 'task').length,
    reminders: activeItems.filter((item) => item.type === 'reminder').length,
    appointments: activeItems.filter((item) => item.type === 'appointment').length,
  }
}

/**
 * Get active items for a specific date
 */
export function getActiveItemsForDate(date: string): ActiveItem[] {
  return getActiveItems().filter((item) => item.date === date)
}
