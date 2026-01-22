/**
 * LocalStorage Adapter
 * 
 * Wraps browser localStorage with metadata support.
 * Handles legacy data migration automatically.
 */

import { StorageAdapter, StorageItem, StorageMetadata } from './types'
import { logger } from '@/lib/logger'

export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Get data from localStorage
   * Handles both new format (with metadata) and legacy format
   */
  async get<T>(key: string): Promise<StorageItem<T> | null> {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      
      const parsed = JSON.parse(raw)
      
      // Check if it's new format (has metadata)
      if (parsed.metadata && parsed.data !== undefined) {
        return parsed as StorageItem<T>
      }
      
      // Legacy format - wrap it with metadata
      logger.debug(`Migrating legacy data for key: ${key}`)
      return {
        data: parsed as T,
        metadata: {
          version: 1,
          lastModified: new Date().toISOString(),
          source: 'local',
        },
      }
    } catch (error) {
      logger.error(`Failed to parse storage item: ${key}`, error)
      return null
    }
  }

  /**
   * Save data to localStorage with metadata
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const item: StorageItem<T> = {
        data: value,
        metadata: {
          version: 1,
          lastModified: new Date().toISOString(),
          source: 'local',
        },
      }
      
      localStorage.setItem(key, JSON.stringify(item))
      logger.debug(`Saved to storage: ${key}`)
    } catch (error) {
      logger.error(`Failed to save to storage: ${key}`, error)
      throw new Error(`Storage write failed: ${key}`)
    }
  }

  /**
   * Delete data from localStorage
   */
  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
      logger.debug(`Deleted from storage: ${key}`)
    } catch (error) {
      logger.error(`Failed to delete from storage: ${key}`, error)
      throw new Error(`Storage delete failed: ${key}`)
    }
  }

  /**
   * Clear all localStorage (use with extreme caution)
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear()
      logger.warn('All storage cleared')
    } catch (error) {
      logger.error('Failed to clear storage', error)
      throw new Error('Storage clear failed')
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
  }
}
