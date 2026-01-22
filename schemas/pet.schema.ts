/**
 * Pet Schema - Zod Validation
 */

import { z } from 'zod'

export const PetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  breed: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
})

export type Pet = z.infer<typeof PetSchema>

export function validatePet(data: unknown): Pet {
  return PetSchema.parse(data)
}

export function isValidPet(data: unknown): data is Pet {
  return PetSchema.safeParse(data).success
}

export function validatePets(data: unknown[]): Pet[] {
  return data.filter((item) => {
    const result = PetSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid pet data:', item, result.error)
    }
    return result.success
  }) as Pet[]
}
