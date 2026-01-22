/**
 * Family Member Schema - Zod Validation
 */

import { z } from 'zod'

export const FamilyMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  relationship: z.string().optional(),
  age: z.number().int().positive().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
})

export type FamilyMember = z.infer<typeof FamilyMemberSchema>

export function validateFamilyMember(data: unknown): FamilyMember {
  return FamilyMemberSchema.parse(data)
}

export function isValidFamilyMember(data: unknown): data is FamilyMember {
  return FamilyMemberSchema.safeParse(data).success
}

export function validateFamilyMembers(data: unknown[]): FamilyMember[] {
  return data.filter((item) => {
    const result = FamilyMemberSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid family member data:', item, result.error)
    }
    return result.success
  }) as FamilyMember[]
}
