/**
 * Storage Module Entry Point
 * 
 * Exports the configured storage adapter.
 * To switch from localStorage to Supabase, just change this one line.
 */

import { StorageAdapter } from './types'
import { LocalStorageAdapter } from './LocalStorageAdapter'
// import { SupabaseAdapter } from './SupabaseAdapter' // Future

/**
 * Active Storage Adapter
 * 
 * Current: LocalStorageAdapter
 * Future: SupabaseAdapter (when ready)
 */
export const storage: StorageAdapter = new LocalStorageAdapter()

// Re-export types for convenience
export * from './types'
export { LocalStorageAdapter } from './LocalStorageAdapter'
export { SupabaseAdapter } from './SupabaseAdapter'
