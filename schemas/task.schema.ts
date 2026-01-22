/**
 * Task Schema - Zod Validation
 * 
 * Runtime validation for task data.
 * Ensures data integrity and catches corruption early.
 */

import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().min(1, 'Task title is required').max(200, 'Task title too long'),
  category: z.enum(['home', 'work', 'personal', 'shopping', 'health', 'finance', 'other', 'reminder']),
  dueDate: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

export type Task = z.infer<typeof TaskSchema>

/**
 * Validate a single task
 * Throws ZodError if invalid
 */
export function validateTask(data: unknown): Task {
  return TaskSchema.parse(data)
}

/**
 * Check if data is a valid task
 * Returns boolean (no throw)
 */
export function isValidTask(data: unknown): data is Task {
  return TaskSchema.safeParse(data).success
}

/**
 * Validate array of tasks
 * Returns only valid tasks, logs invalid ones
 */
export function validateTasks(data: unknown[]): Task[] {
  return data.filter((item) => {
    const result = TaskSchema.safeParse(item)
    if (!result.success) {
      console.warn('Invalid task data:', item, result.error)
    }
    return result.success
  }) as Task[]
}
