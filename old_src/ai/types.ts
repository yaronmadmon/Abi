/**
 * AI Abstraction Layer Types
 * Input handling, intent normalization, and action planning
 */

export enum InputType {
  VOICE = 'voice',
  TEXT = 'text',
}

export interface Input {
  id: string;
  type: InputType;
  content: string;
  timestamp: string; // ISO 8601
  metadata?: Record<string, unknown>;
}

export enum IntentCategory {
  TASK = 'task',
  EVENT = 'event',
  QUERY = 'query',
  DOCUMENT = 'document',
  BILL = 'bill',
  NOTE = 'note',
  PERSON = 'person',
  PET = 'pet',
  HOUSEHOLD = 'household',
  MOOD = 'mood',
  UNKNOWN = 'unknown',
}

export enum IntentAction {
  // Task actions
  CREATE_TASK = 'create_task',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  LIST_TASKS = 'list_tasks',
  COMPLETE_TASK = 'complete_task',
  
  // Event actions
  CREATE_EVENT = 'create_event',
  UPDATE_EVENT = 'update_event',
  DELETE_EVENT = 'delete_event',
  LIST_EVENTS = 'list_events',
  
  // Query actions
  SEARCH = 'search',
  ASK = 'ask',
  GET_INFO = 'get_info',
  
  // Document actions
  UPLOAD_DOCUMENT = 'upload_document',
  GET_DOCUMENT = 'get_document',
  LIST_DOCUMENTS = 'list_documents',
  SEARCH_DOCUMENTS = 'search_documents',
  SIGN_DOCUMENT = 'sign_document',
  SEND_FOR_SIGNATURE = 'send_for_signature',
  
  // Email actions
  SEND_EMAIL = 'send_email',
  DRAFT_EMAIL = 'draft_email',
  READ_EMAIL = 'read_email',
  LIST_EMAILS = 'list_emails',
  SEARCH_EMAILS = 'search_emails',
  SUMMARIZE_THREAD = 'summarize_thread',
  
  // Contact actions
  GET_CONTACT = 'get_contact',
  CREATE_CONTACT = 'create_contact',
  UPDATE_CONTACT = 'update_contact',
  LIST_CONTACTS = 'list_contacts',
  SUGGEST_CONTACTS = 'suggest_contacts',
  
  // Follow-up actions
  CREATE_FOLLOWUP = 'create_followup',
  LIST_FOLLOWUPS = 'list_followups',
  SEND_REMINDER = 'send_reminder',
  
  // Bill actions
  CREATE_BILL = 'create_bill',
  UPDATE_BILL = 'update_bill',
  PAY_BILL = 'pay_bill',
  LIST_BILLS = 'list_bills',
  
  // Note actions
  CREATE_NOTE = 'create_note',
  UPDATE_NOTE = 'update_note',
  DELETE_NOTE = 'delete_note',
  LIST_NOTES = 'list_notes',
  
  // Person actions
  GET_PERSON = 'get_person',
  UPDATE_PERSON = 'update_person',
  
  // Pet actions
  CREATE_PET = 'create_pet',
  UPDATE_PET = 'update_pet',
  GET_PET = 'get_pet',
  
  // Household actions
  GET_HOUSEHOLD = 'get_household',
  UPDATE_HOUSEHOLD = 'update_household',
  
  // Unknown
  UNKNOWN = 'unknown',
}

export interface Intent {
  id: string;
  category: IntentCategory;
  action: IntentAction;
  confidence: number; // 0-1
  entities: IntentEntity[];
  originalInput: Input;
  normalizedText: string;
}

export interface IntentEntity {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export enum ActionStatus {
  PENDING = 'pending',
  PLANNED = 'planned',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PlannedAction {
  id: string;
  intent: Intent;
  status: ActionStatus;
  steps: ActionStep[];
  estimatedDuration?: number; // in seconds
  priority: number; // 0-100
  requiresConfirmation: boolean;
  createdAt: string;
}

export interface ActionStep {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, unknown>;
  dependencies: string[]; // IDs of steps that must complete first
  estimatedDuration?: number;
}
