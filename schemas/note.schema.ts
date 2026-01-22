/**
 * Note Schema - Zod Validation
 */

import { z } from 'zod'

export const NoteSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(500),
  body: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isPinned: z.boolean().optional(),
})

export type Note = z.infer<typeof NoteSchema>

export function validateNote(data: unknown): Note {
  return NoteSchema.parse(data)
}

export function isValidNote(data: unknown): data is Note {
  return NoteSchema.safeParse(data).success
}

export function validateNotes(data: unknown[]): Note[] {
  return data.filter((item) => {
    const result = NoteSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid note data:', item, result.error)
    }
    return result.success
  }) as Note[]
}
