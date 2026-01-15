export interface HomeProfile {
  numberOfPeople: number
  hasPets: boolean
  homeType: 'apartment' | 'house'
  topStruggles: string[]
  dietaryPreferences: string[]
  weeklyRoutine?: string
}

export interface Task {
  id: string
  title: string
  category: 'cleaning' | 'errands' | 'kids' | 'home-maintenance' | 'other'
  dueDate?: string
  completed: boolean
  createdAt: string
}

export interface Meal {
  id: string
  name: string
  day: string // 'monday' | 'tuesday' | etc.
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  createdAt: string
}

export interface ShoppingItem {
  id: string
  name: string
  category: 'produce' | 'dairy' | 'meat' | 'cleaning' | 'pantry' | 'other'
  completed: boolean
  createdAt: string
}

export type AIInputType = 'task' | 'meal' | 'shopping' | 'reminder' | 'unknown'

export interface AIClassification {
  type: AIInputType
  data: {
    title?: string
    category?: string
    day?: string
    mealType?: string
  }
  needsClarification?: boolean
  clarificationQuestion?: string
}

export interface FamilyMember {
  id: string
  name: string
  relationship?: string // e.g., "spouse", "child", "parent"
  age?: number
  notes?: string
  photo?: string // Base64 data URL
  phone?: string
  email?: string
  createdAt: string
  updatedAt?: string
}

export interface Pet {
  id: string
  name: string
  type: string // e.g., "dog", "cat", "bird"
  breed?: string
  age?: number
  birthday?: string // YYYY-MM-DD format
  notes?: string
  photo?: string // Base64 data URL
  vetName?: string
  vetPhone?: string
  createdAt: string
  updatedAt?: string
}