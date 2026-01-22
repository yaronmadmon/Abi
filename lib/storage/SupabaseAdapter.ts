/**
 * Supabase Adapter (Future Implementation)
 * 
 * This is a placeholder for future Supabase integration.
 * When ready to migrate from localStorage → Supabase, implement these methods.
 */

import { StorageAdapter, StorageItem } from './types'
import { logger } from '@/lib/logger'

export class SupabaseAdapter implements StorageAdapter {
  constructor() {
    logger.info('SupabaseAdapter initialized (not yet implemented)')
  }

  async get<T>(key: string): Promise<StorageItem<T> | null> {
    throw new Error('Supabase adapter not yet implemented. Use LocalStorageAdapter.')
  }

  async set<T>(key: string, value: T): Promise<void> {
    throw new Error('Supabase adapter not yet implemented. Use LocalStorageAdapter.')
  }

  async delete(key: string): Promise<void> {
    throw new Error('Supabase adapter not yet implemented. Use LocalStorageAdapter.')
  }

  async clear(): Promise<void> {
    throw new Error('Supabase adapter not yet implemented. Use LocalStorageAdapter.')
  }
}

/**
 * Future Implementation Checklist:
 * 
 * ☐ Set up Supabase client
 * ☐ Implement get() - fetch from database
 * ☐ Implement set() - insert/update in database
 * ☐ Implement delete() - remove from database
 * ☐ Add sync conflict resolution
 * ☐ Add offline support
 * ☐ Add real-time subscriptions
 * ☐ Migrate existing localStorage data
 */
