/**
 * Executor Initialization
 * Registers all command executors at system startup
 * 
 * ARCHITECTURAL GUARANTEE:
 * This is the ONLY place where executors are registered.
 * Executors are private methods that can only be accessed through the registry.
 */

import { executorRegistry } from './executorRegistry'
import { logger } from '@/lib/logger'
import { tasksHandler } from '../handlers/tasksHandler'
import { mealsHandler } from '../handlers/mealsHandler'
import { shoppingHandler } from '../handlers/shoppingHandler'
import { remindersHandler } from '../handlers/remindersHandler'
import { appointmentsHandler } from '../handlers/appointmentsHandler'
import { familyHandler } from '../handlers/familyHandler'
import { petsHandler } from '../handlers/petsHandler'

/**
 * Initialize all executors
 * Must be called once at application startup
 */
export function initExecutors() {
  // Register task executors
  executorRegistry.register('task.create', async (payload) => {
    return await (tasksHandler as any).execute(payload)
  })
  executorRegistry.register('task.update', async (payload) => {
    return await (tasksHandler as any).update(payload)
  })
  executorRegistry.register('task.delete', async (payload) => {
    return await (tasksHandler as any).delete(payload)
  })
  
  // Register meal executors  
  executorRegistry.register('meal.create', async (payload) => {
    return await (mealsHandler as any).execute(payload)
  })
  executorRegistry.register('meal.update', async (payload) => {
    return await (mealsHandler as any).update(payload)
  })
  executorRegistry.register('meal.delete', async (payload) => {
    return await (mealsHandler as any).delete(payload)
  })
  
  // Register shopping executors
  executorRegistry.register('shopping.add', async (payload) => {
    return await (shoppingHandler as any).execute(payload)
  })
  executorRegistry.register('shopping.update', async (payload) => {
    return await (shoppingHandler as any).update(payload)
  })
  executorRegistry.register('shopping.remove', async (payload) => {
    return await (shoppingHandler as any).remove(payload)
  })
  
  // Register reminder executors
  executorRegistry.register('reminder.create', async (payload) => {
    return await (remindersHandler as any).execute(payload)
  })
  executorRegistry.register('reminder.update', async (payload) => {
    return await (remindersHandler as any).update(payload)
  })
  executorRegistry.register('reminder.delete', async (payload) => {
    return await (remindersHandler as any).delete(payload)
  })
  
  // Register appointment executors
  executorRegistry.register('appointment.create', async (payload) => {
    return await (appointmentsHandler as any).execute(payload)
  })
  executorRegistry.register('appointment.update', async (payload) => {
    return await (appointmentsHandler as any).update(payload)
  })
  executorRegistry.register('appointment.delete', async (payload) => {
    return await (appointmentsHandler as any).delete(payload)
  })
  
  // Register family executors
  executorRegistry.register('family.create', async (payload) => {
    return await (familyHandler as any).execute(payload)
  })
  executorRegistry.register('family.update', async (payload) => {
    return await (familyHandler as any).update(payload)
  })
  executorRegistry.register('family.delete', async (payload) => {
    return await (familyHandler as any).delete(payload)
  })
  
  // Register pet executors
  executorRegistry.register('pet.create', async (payload) => {
    return await (petsHandler as any).execute(payload)
  })
  executorRegistry.register('pet.update', async (payload) => {
    return await (petsHandler as any).update(payload)
  })
  executorRegistry.register('pet.delete', async (payload) => {
    return await (petsHandler as any).delete(payload)
  })
  
  // Mark registry as initialized
  executorRegistry.markInitialized()
  
  const registeredCount = executorRegistry.getRegisteredTypes().length
  logger.debug(`Command executors initialized (${registeredCount} executors registered: 7 create, 7 update, 7 delete)`)
}

/**
 * Check if executors are initialized
 */
export function areExecutorsInitialized(): boolean {
  return executorRegistry.getRegisteredTypes().length > 0
}
