/**
 * Storage Layer Types
 * 
 * Provides type-safe abstraction over localStorage with future-proof metadata.
 * This allows easy migration to Supabase or other storage backends later.
 */

export interface StorageMetadata {
  /**
   * Schema version for data migrations
   * Increment when data format changes
   */
  version: number
  
  /**
   * ISO timestamp of last modification
   * Useful for sync conflict resolution
   */
  lastModified: string
  
  /**
   * Source of the data
   * 'local' = localStorage, 'remote' = server/Supabase
   */
  source: 'local' | 'remote'
  
  /**
   * Optional checksum for data integrity
   * Can be used to detect corruption
   */
  checksum?: string
}

export interface StorageItem<T> {
  /**
   * The actual data
   */
  data: T
  
  /**
   * Metadata for versioning, sync, and integrity
   */
  metadata: StorageMetadata
}

/**
 * Storage Adapter Interface
 * 
 * All storage implementations must follow this interface.
 * This allows swapping localStorage → Supabase without code changes.
 */
export interface StorageAdapter {
  /**
   * Get data from storage
   * Returns null if key doesn't exist
   */
  get<T>(key: string): Promise<StorageItem<T> | null>
  
  /**
   * Save data to storage
   * Automatically adds metadata
   */
  set<T>(key: string, value: T): Promise<void>
  
  /**
   * Delete data from storage
   */
  delete(key: string): Promise<void>
  
  /**
   * Clear all data (use with caution)
   */
  clear(): Promise<void>
}

/**
 * Storage Keys (centralized for consistency)
 */
export const STORAGE_KEYS = {
  TASKS: 'tasks',
  NOTES: 'notes',
  MEALS: 'meals',
  SHOPPING: 'shopping',
  APPOINTMENTS: 'appointments',
  REMINDERS: 'reminders',
  FAMILY: 'family',
  PETS: 'pets',
  SETTINGS: 'settings',
  CALENDAR_PREFS: 'calendarPreferences',
} as const

export type StorageKey = keyof typeof STORAGE_KEYS
