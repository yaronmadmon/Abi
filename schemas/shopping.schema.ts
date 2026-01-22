/**
 * Shopping Schema - Zod Validation
 */

import { z } from 'zod'

export const ShoppingItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  quantity: z.string().optional(),
  category: z.string().optional(),
  checked: z.boolean(),
  addedAt: z.string().datetime().optional(),
})

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>

export function validateShoppingItem(data: unknown): ShoppingItem {
  return ShoppingItemSchema.parse(data)
}

export function isValidShoppingItem(data: unknown): data is ShoppingItem {
  return ShoppingItemSchema.safeParse(data).success
}

export function validateShoppingItems(data: unknown[]): ShoppingItem[] {
  return data.filter((item) => {
    const result = ShoppingItemSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid shopping item data:', item, result.error)
    }
    return result.success
  }) as ShoppingItem[]
}
