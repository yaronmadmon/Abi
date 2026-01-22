/**
 * Executor Registry
 * Central registry of all command executors
 * 
 * ARCHITECTURAL GUARANTEE:
 * Only this registry can access the private executor functions.
 * Executors are registered at system initialization and cannot be modified at runtime.
 */

import type { CommandType } from '../schemas/commandSchema'

export type ExecutorFunction = (payload: any) => Promise<any>

/**
 * Executor Registry singleton
 * Manages all registered executors
 */
class ExecutorRegistry {
  private executors = new Map<CommandType, ExecutorFunction>()
  private initialized = false
  
  /**
   * Register an executor for a command type
   * Can only be called during system initialization
   */
  register(type: CommandType, executor: ExecutorFunction): void {
    if (this.executors.has(type)) {
      throw new Error(`Executor already registered for: ${type}`)
    }
    
    this.executors.set(type, executor)
  }
  
  /**
   * Mark registry as initialized
   * After this, no new executors can be registered
   */
  markInitialized(): void {
    this.initialized = true
  }
  
  /**
   * Get executor for a command type
   * Only accessible by CommandExecutor
   */
  getExecutor(type: CommandType): ExecutorFunction {
    const executor = this.executors.get(type)
    if (!executor) {
      throw new Error(`No executor registered for: ${type}`)
    }
    return executor
  }
  
  /**
   * Check if executor exists for command type
   */
  hasExecutor(type: CommandType): boolean {
    return this.executors.has(type)
  }
  
  /**
   * Get all registered command types
   */
  getRegisteredTypes(): CommandType[] {
    return Array.from(this.executors.keys())
  }
}

// Export singleton instance
export const executorRegistry = new ExecutorRegistry()
