/**
 * Common Schemas - Shared Validation Utilities
 */

import { z } from 'zod'

/**
 * Date string validation (YYYY-MM-DD format)
 */
export const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')

/**
 * Time string validation (HH:MM format)
 */
export const TimeString = z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (expected HH:MM)')

/**
 * ISO DateTime string validation
 */
export const ISODateTime = z.string().datetime()

/**
 * Non-empty string
 */
export const NonEmptyString = z.string().min(1, 'Cannot be empty')

/**
 * Optional non-empty string (null/undefined OK, but if provided must not be empty)
 */
export const OptionalNonEmptyString = z.string().min(1).optional()

/**
 * ID validation (non-empty string)
 */
export const IDString = z.string().min(1, 'ID required')

/**
 * Category enum (can be extended)
 */
export const CategoryEnum = z.enum(['home', 'work', 'personal', 'shopping', 'health', 'finance', 'other'])

/**
 * Priority enum
 */
export const PriorityEnum = z.enum(['low', 'medium', 'high'])

/**
 * Meal type enum
 */
export const MealTypeEnum = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
