/**
 * Appointment Schema - Zod Validation
 */

import { z } from 'zod'

export const AppointmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  forWho: z.string().optional(),
  createdAt: z.string().datetime().optional(),
})

export type Appointment = z.infer<typeof AppointmentSchema>

export function validateAppointment(data: unknown): Appointment {
  return AppointmentSchema.parse(data)
}

export function isValidAppointment(data: unknown): data is Appointment {
  return AppointmentSchema.safeParse(data).success
}

export function validateAppointments(data: unknown[]): Appointment[] {
  return data.filter((item) => {
    const result = AppointmentSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid appointment data:', item, result.error)
    }
    return result.success
  }) as Appointment[]
}
