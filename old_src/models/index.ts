/**
 * Unified Data Model
 * 
 * Core entities for the Home Assistant Companion Life OS
 */

export type EntityId = string;
export type Timestamp = string; // ISO 8601 format

// Base entity interface
export interface BaseEntity {
  id: EntityId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Household
export interface Household extends BaseEntity {
  name: string;
  address?: string;
  timezone: string;
  currency: string;
}

// Person types
export enum PersonRole {
  ADULT = 'adult',
  KID = 'kid',
}

export interface Person extends BaseEntity {
  householdId: EntityId;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: PersonRole;
  dateOfBirth?: Timestamp;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
  // Kitchen domain - optional food preferences
  foodLikes?: string[];
  foodDislikes?: string[];
  foodAllergies?: string[];
}

// Pets
export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  OTHER = 'other',
}

export interface Pet extends BaseEntity {
  householdId: EntityId;
  name: string;
  type: PetType;
  notes?: string;
  vetName?: string;
  vetPhone?: string;
  breed?: string;
  dateOfBirth?: Timestamp;
  avatarUrl?: string;
  ownerIds?: EntityId[];
  medicalNotes?: string;
}

// Tasks
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task extends BaseEntity {
  householdId: EntityId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToIds: EntityId[];
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  tags: string[];
}

// Events
export interface Event extends BaseEntity {
  householdId: EntityId;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  location?: string;
  attendeeIds: EntityId[];
  isAllDay: boolean;
  recurrencePattern?: string;
  tags: string[];
}

// Documents
export enum DocumentType {
  PDF = 'pdf',
  IMAGE = 'image',
  TEXT = 'text',
  SPREADSHEET = 'spreadsheet',
  OTHER = 'other',
}

export interface Document extends BaseEntity {
  householdId: EntityId;
  title: string;
  description?: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  uploadedById: EntityId;
  tags: string[];
  folderPath?: string;
  // Phase 4 additions
  category?: string; // DocumentCategory enum value
  ocrText?: string; // Full text extracted via OCR
  currentVersion: number; // Version number, starts at 1
  isSigned: boolean; // Whether document has been signed
  encrypted: boolean; // Whether document is encrypted
  // Gentle connections
  linkedToPersonId?: EntityId; // Optional link to a person
  linkedToRoomId?: EntityId; // Optional link to a room
  // Life Utilities additions
  sharedWithIds?: EntityId[]; // Family members this document is shared with (read-only)
}

// Bills
export enum BillStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface Bill extends BaseEntity {
  householdId: EntityId;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  dueDate: Timestamp;
  paidDate?: Timestamp;
  status: BillStatus;
  payee: string;
  category: string;
  paidById?: EntityId;
  attachmentIds?: EntityId[];
  tags: string[];
}

// Notes
export interface Note extends BaseEntity {
  householdId: EntityId;
  title: string;
  content: string;
  authorId: EntityId;
  tags: string[];
  isPinned: boolean;
  color?: string;
}

// Rooms
export interface Room extends BaseEntity {
  householdId: EntityId;
  name: string;
  description?: string;
  area?: string; // e.g., "Living Room", "Kitchen", "Bedroom"
  floor?: string; // e.g., "First Floor", "Second Floor"
}

// Assets
export interface Asset extends BaseEntity {
  householdId: EntityId;
  name: string;
  description?: string;
  location?: string; // Room or location where asset is stored
  category?: string; // e.g., "Electronics", "Furniture", "Appliances"
}

// Kitchen Domain
export enum PantryLocation {
  PANTRY = 'pantry',
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
}

export interface PantryItem extends BaseEntity {
  householdId: EntityId;
  name: string;
  location: PantryLocation;
  isRunningLow: boolean;
}

export interface Recipe extends BaseEntity {
  householdId: EntityId;
  name: string;
  ingredients: string; // Free text
  instructions: string;
  notes?: string; // e.g., "kids love this", "good for guests"
  photoUrl?: string;
  linkedPersonIds?: EntityId[]; // People this recipe is linked to
  occasionTags?: string[]; // e.g., "weeknight", "special", "holiday"
}

export interface GroceryListItem extends BaseEntity {
  householdId: EntityId;
  name: string;
  isChecked: boolean;
  addedFrom?: 'manual' | 'recipe' | 'pantry' | 'suggestion';
  sourceId?: EntityId; // ID of recipe or pantry item if added from there
  sharedWithIds?: EntityId[]; // Family members who can view this list
}

export interface KitchenNote extends BaseEntity {
  householdId: EntityId;
  title: string;
  content: string;
  authorId: EntityId;
  linkedRecipeId?: EntityId;
  linkedPantryItemId?: EntityId;
  tags?: string[];
}

// Collection types for easier access
export interface HouseholdData {
  household: Household;
  people: Person[];
  pets: Pet[];
  tasks: Task[];
  events: Event[];
  documents: Document[];
  bills: Bill[];
  notes: Note[];
}
