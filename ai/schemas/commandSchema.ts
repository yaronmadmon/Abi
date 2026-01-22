/**
 * Command Schema
 * Defines the structure for AI-generated commands and proposals
 * 
 * ARCHITECTURAL GUARANTEE:
 * Commands are pure data structures - they describe intent but contain no execution logic.
 * This ensures AI can only propose actions, never execute them directly.
 */

export type CommandType =
  | 'task.create'
  | 'task.update'
  | 'task.delete'
  | 'meal.create'
  | 'meal.update'
  | 'meal.delete'
  | 'shopping.add'
  | 'shopping.remove'
  | 'shopping.update'
  | 'reminder.create'
  | 'reminder.update'
  | 'reminder.delete'
  | 'appointment.create'
  | 'appointment.update'
  | 'appointment.delete'
  | 'family.create'
  | 'family.update'
  | 'family.delete'
  | 'pet.create'
  | 'pet.update'
  | 'pet.delete'

export type OperationType = 'create' | 'update' | 'delete'

/**
 * Immutable command descriptor - AI output
 * This is what the AI generates after understanding user intent
 */
export interface ActionCommand {
  id: string                    // Unique command ID
  type: CommandType            // What kind of action
  operation: OperationType     // Create, update, or delete
  entity: string               // What entity (task, meal, etc)
  payload: Record<string, any> // Action parameters
  metadata: {
    confidence: number         // AI confidence (0-1)
    userInput: string          // Original user input
    timestamp: number          // When command was created
    context?: string           // App context (current page, etc)
  }
}

/**
 * Human-readable proposal for user review
 * This is what the user sees before approving
 */
export interface ActionProposal {
  command: ActionCommand
  summary: {
    title: string              // "Add task: Buy groceries"
    description: string        // "I'll add 'Buy groceries' to your tasks"
    impacts: string[]          // ["Creates 1 new task", "Due: Tomorrow"]
  }
  preview?: any                // Optional preview data (what will be created)
  risks?: string[]             // Warnings if destructive (e.g., "Will delete 5 items")
  requiresApproval: boolean    // Whether this needs user confirmation
}

/**
 * Post-approval execution result
 * Returned after command is executed
 */
export interface ExecutionResult {
  commandId: string
  success: boolean
  message: string              // User-friendly message
  data?: any                   // Created/updated entity data
  error?: string               // Error message if failed
}

/**
 * Approval token - proof that user approved a command
 * Only the confirmation UI can generate these
 */
export interface ApprovalToken {
  commandId: string
  approvedBy: 'user'           // Future: could track which user
  approvedAt: number           // Timestamp of approval
  signature: string            // HMAC signature for verification
}
