/**
 * Action Intent Schema
 * Structured actions that the assistant can perform
 * All actions require confirmation before execution
 */

export type ActionType =
  | 'create_task'
  | 'create_meal'
  | 'create_shopping_item'
  | 'create_reminder'
  | 'navigate'
  | 'search'
  | 'update'
  | 'delete'
  | 'unknown'

export type EntityType =
  | 'task'
  | 'meal'
  | 'shopping'
  | 'reminder'
  | 'appointment'
  | 'calendar'
  | 'page'
  | 'unknown'

export interface ActionIntent {
  action: ActionType
  entity: EntityType
  params: Record<string, any>
  confidence: number // 0-1
  humanReadable: string // Human-readable explanation of the action
  raw: string // Original user input
}

export interface ActionConfirmation {
  intent: ActionIntent
  summary: string // Confirmation message to show/speak
  requiresConfirmation: boolean
}
