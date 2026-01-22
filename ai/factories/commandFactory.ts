/**
 * Command Factory
 * Converts AI intents into actionable commands and proposals
 * 
 * ARCHITECTURAL GUARANTEE:
 * This factory only creates command descriptors (data structures).
 * It has no capability to execute commands or mutate state.
 */

import type { AIIntent } from '../schemas/intentSchema'
import type { ActionCommand, ActionProposal, CommandType } from '../schemas/commandSchema'

/**
 * Generate unique command ID
 */
function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Map AIIntent type to CommandType
 */
function mapIntentToCommandType(intentType: string, operation: 'create' | 'update' | 'delete' = 'create'): CommandType {
  const mapping: Record<string, string> = {
    'task': 'task',
    'meal': 'meal',
    'shopping': 'shopping',
    'reminder': 'reminder',
    'appointment': 'appointment',
    'family': 'family',
    'pet': 'pet',
  }
  
  const entity = mapping[intentType]
  if (!entity) {
    throw new Error(`Unknown intent type: ${intentType}`)
  }
  
  // Special case: shopping uses 'add' instead of 'create'
  if (entity === 'shopping' && operation === 'create') {
    return 'shopping.add' as CommandType
  }
  
  return `${entity}.${operation}` as CommandType
}

/**
 * Create ActionCommand from AIIntent
 * This is the bridge between AI reasoning and the execution system
 */
export function createCommandFromIntent(intent: AIIntent, context?: string): ActionCommand {
  // Skip non-actionable intents
  if (intent.type === 'clarification' || intent.type === 'unknown') {
    throw new Error('Cannot create command from clarification or unknown intent')
  }
  
  const commandId = generateCommandId()
  const commandType = mapIntentToCommandType(intent.type, 'create')
  
  return {
    id: commandId,
    type: commandType,
    operation: 'create',
    entity: intent.type,
    payload: intent.payload || {},
    metadata: {
      confidence: intent.confidence,
      userInput: intent.raw,
      timestamp: Date.now(),
      context,
    },
  }
}

/**
 * Create update/delete command with safety checks
 * SAFETY: Requires ID in payload and validates operation
 */
export function createUpdateCommand(
  entity: string,
  payload: { id: string } & Record<string, any>,
  context?: string
): ActionCommand {
  if (!payload.id) {
    throw new Error('ID is required for update operations')
  }
  
  const commandId = generateCommandId()
  const commandType = mapIntentToCommandType(entity, 'update')
  
  return {
    id: commandId,
    type: commandType,
    operation: 'update',
    entity,
    payload,
    metadata: {
      confidence: 1.0,
      userInput: `Update ${entity}`,
      timestamp: Date.now(),
      context,
    },
  }
}

/**
 * Create delete command with safety checks
 * SAFETY: Requires ID in payload
 */
export function createDeleteCommand(
  entity: string,
  payload: { id: string },
  context?: string
): ActionCommand {
  if (!payload.id) {
    throw new Error('ID is required for delete operations')
  }
  
  const commandId = generateCommandId()
  const commandType = mapIntentToCommandType(entity, 'delete')
  
  // Special case: shopping uses 'remove' instead of 'delete'
  const operation = entity === 'shopping' ? 'remove' : 'delete'
  const finalCommandType = entity === 'shopping' ? 'shopping.remove' as CommandType : commandType
  
  return {
    id: commandId,
    type: finalCommandType,
    operation: operation as 'delete',
    entity,
    payload,
    metadata: {
      confidence: 1.0,
      userInput: `Delete ${entity}`,
      timestamp: Date.now(),
      context,
    },
  }
}

/**
 * Generate human-readable proposal from command
 */
export function generateProposal(command: ActionCommand, requiresApproval: boolean = true): ActionProposal {
  const [entity, operation] = command.type.split('.')
  
  // Generate title
  const title = generateTitle(entity, operation, command.payload)
  
  // Generate description
  const description = generateDescription(entity, operation, command.payload)
  
  // Generate impacts
  const impacts = generateImpacts(entity, operation, command.payload)
  
  // Generate preview
  const preview = generatePreview(entity, command.payload)
  
  // Identify risks
  const risks = identifyRisks(operation, command.payload)
  
  return {
    command,
    summary: {
      title,
      description,
      impacts,
    },
    preview,
    risks,
    requiresApproval,
  }
}

/**
 * Generate proposal title
 */
function generateTitle(entity: string, operation: string, payload: any): string {
  const actionVerb = operation === 'create' ? 'Add' : operation === 'update' ? 'Update' : 'Delete'
  
  switch (entity) {
    case 'task':
      return `${actionVerb} task: ${payload.title || 'New task'}`
    case 'meal':
      return `${actionVerb} meal: ${payload.name || 'New meal'}`
    case 'shopping':
      return `${actionVerb} ${payload.items?.length || 0} item(s) to shopping list`
    case 'reminder':
      return `${actionVerb} reminder: ${payload.title || 'New reminder'}`
    case 'appointment':
      return `${actionVerb} appointment: ${payload.title || 'New appointment'}`
    case 'family':
      return `${actionVerb} family member: ${payload.name || 'New member'}`
    case 'pet':
      return `${actionVerb} pet: ${payload.name || 'New pet'}`
    default:
      return `${actionVerb} ${entity}`
  }
}

/**
 * Generate proposal description
 */
function generateDescription(entity: string, operation: string, payload: any): string {
  const actionPhrase = operation === 'create' ? "I'll add" : operation === 'update' ? "I'll update" : "I'll remove"
  
  switch (entity) {
    case 'task':
      return `${actionPhrase} "${payload.title}" to your tasks${payload.dueDate ? ` for ${new Date(payload.dueDate).toLocaleDateString()}` : ''}.`
    case 'meal':
      return `${actionPhrase} "${payload.name}" to your meal plan${payload.day ? ` for ${payload.day}` : ''}.`
    case 'shopping':
      const itemsList = payload.items?.slice(0, 3).join(', ') || ''
      const remaining = (payload.items?.length || 0) - 3
      return `${actionPhrase} ${itemsList}${remaining > 0 ? ` and ${remaining} more` : ''} to your shopping list.`
    case 'reminder':
      return `${actionPhrase} reminder "${payload.title}"${payload.date ? ` for ${new Date(payload.date).toLocaleDateString()}` : ''}.`
    case 'appointment':
      return `${actionPhrase} appointment "${payload.title}"${payload.date ? ` on ${new Date(payload.date).toLocaleDateString()}` : ''}.`
    case 'family':
      return `${actionPhrase} "${payload.name}" to your family${payload.relationship ? ` as your ${payload.relationship}` : ''}.`
    case 'pet':
      return `${actionPhrase} "${payload.name}" to your pets${payload.type ? ` (${payload.type})` : ''}.`
    default:
      return `${actionPhrase} ${entity}.`
  }
}

/**
 * Generate impacts list
 */
function generateImpacts(entity: string, operation: string, payload: any): string[] {
  const impacts: string[] = []
  
  switch (entity) {
    case 'task':
      impacts.push(`Creates 1 new task`)
      if (payload.category) impacts.push(`Category: ${payload.category}`)
      if (payload.priority) impacts.push(`Priority: ${payload.priority}`)
      if (payload.dueDate) impacts.push(`Due: ${new Date(payload.dueDate).toLocaleDateString()}`)
      break
    case 'meal':
      impacts.push(`Creates 1 new meal`)
      if (payload.mealType) impacts.push(`Type: ${payload.mealType}`)
      if (payload.day) impacts.push(`Day: ${payload.day}`)
      break
    case 'shopping':
      impacts.push(`Creates ${payload.items?.length || 0} shopping item(s)`)
      if (payload.category) impacts.push(`Category: ${payload.category}`)
      break
    case 'reminder':
      impacts.push(`Creates 1 new reminder`)
      if (payload.date) impacts.push(`Date: ${new Date(payload.date).toLocaleDateString()}`)
      if (payload.time) impacts.push(`Time: ${payload.time}`)
      break
    case 'appointment':
      impacts.push(`Creates 1 new appointment`)
      if (payload.date) impacts.push(`Date: ${new Date(payload.date).toLocaleDateString()}`)
      if (payload.time) impacts.push(`Time: ${payload.time}`)
      if (payload.location) impacts.push(`Location: ${payload.location}`)
      break
    case 'family':
      impacts.push(`Adds 1 family member`)
      if (payload.relationship) impacts.push(`Relationship: ${payload.relationship}`)
      break
    case 'pet':
      impacts.push(`Adds 1 pet`)
      if (payload.type) impacts.push(`Type: ${payload.type}`)
      break
  }
  
  return impacts
}

/**
 * Generate preview data
 */
function generatePreview(entity: string, payload: any): any {
  switch (entity) {
    case 'task':
      return {
        id: `preview_${Date.now()}`,
        title: payload.title,
        category: payload.category || 'other',
        priority: payload.priority || 'medium',
        dueDate: payload.dueDate,
        completed: false,
      }
    case 'meal':
      return {
        id: `preview_${Date.now()}`,
        name: payload.name,
        mealType: payload.mealType || 'dinner',
        day: payload.day || 'monday',
      }
    case 'shopping':
      return {
        items: payload.items?.map((item: string) => ({
          id: `preview_${Date.now()}_${item}`,
          name: item,
          category: payload.category || 'other',
          completed: false,
        })) || [],
      }
    case 'reminder':
      return {
        id: `preview_${Date.now()}`,
        title: payload.title,
        date: payload.date,
        time: payload.time,
      }
    case 'appointment':
      return {
        id: `preview_${Date.now()}`,
        title: payload.title,
        date: payload.date,
        time: payload.time,
        location: payload.location,
      }
    default:
      return payload
  }
}

/**
 * Identify risks
 */
function identifyRisks(operation: string, payload: any): string[] {
  const risks: string[] = []
  
  if (operation === 'delete') {
    risks.push('This action cannot be undone')
  }
  
  // Add more risk detection logic as needed
  
  return risks
}

/**
 * Check if command requires approval based on settings
 */
export function shouldRequireApproval(command: ActionCommand, settings?: any): boolean {
  // If no settings provided, always require approval (safe default)
  if (!settings) return true
  
  // ALWAYS require approval for destructive operations
  if (command.operation === 'delete') {
    return true
  }
  
  // Check global confirmation style
  if (settings.confirmationStyle === 'just_do_it') {
    // Skip confirmation for non-destructive operations
    // UNLESS entity-specific setting overrides it
    if (command.entity === 'shopping' && settings.requireApprovalForShoppingActions) {
      return true  // Override: shopping always requires approval
    }
    return false  // User prefers "just do it"
  }
  
  // Check entity-specific settings
  if (command.entity === 'shopping' && settings.requireApprovalForShoppingActions) {
    return true
  }
  
  // Default: require approval if setting is 'ask_before_doing' (or not specified)
  return settings.confirmationStyle !== 'just_do_it'
}
