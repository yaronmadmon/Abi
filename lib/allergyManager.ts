/**
 * Allergy Management System
 * Handles household allergy preferences and recipe safety filtering
 */

export interface AllergyPreferences {
  allergens: string[]
  showExcluded: boolean
  lastUpdated: string
}

export const COMMON_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'tree-nuts', label: 'Tree Nuts', icon: '🌰' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'sesame', label: 'Sesame', icon: '🌱' },
] as const

export const ALLERGY_STORAGE_KEY = 'householdAllergies'

/**
 * Get household allergy preferences from localStorage
 */
export function getAllergyPreferences(): AllergyPreferences {
  if (typeof window === 'undefined') return { allergens: [], showExcluded: false, lastUpdated: '' }
  
  const stored = localStorage.getItem(ALLERGY_STORAGE_KEY)
  if (!stored) {
    return {
      allergens: [],
      showExcluded: false,
      lastUpdated: new Date().toISOString()
    }
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return { allergens: [], showExcluded: false, lastUpdated: '' }
  }
}

/**
 * Save household allergy preferences to localStorage
 */
export function saveAllergyPreferences(preferences: AllergyPreferences): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(ALLERGY_STORAGE_KEY, JSON.stringify({
    ...preferences,
    lastUpdated: new Date().toISOString()
  }))
  
  // Dispatch event for cross-component updates
  window.dispatchEvent(new Event('allergiesUpdated'))
}

/**
 * Check if a recipe is safe based on household allergies
 */
export function isRecipeSafe(recipeAllergens: string[] = [], householdAllergens: string[]): boolean {
  if (householdAllergens.length === 0) return true
  if (recipeAllergens.length === 0) return true
  
  // Recipe is unsafe if ANY household allergen is present in recipe
  return !householdAllergens.some(allergen => 
    recipeAllergens.includes(allergen)
  )
}

/**
 * Get conflicting allergens between recipe and household
 */
export function getConflictingAllergens(recipeAllergens: string[] = [], householdAllergens: string[]): string[] {
  return householdAllergens.filter(allergen => recipeAllergens.includes(allergen))
}

/**
 * Format allergen names for display
 */
export function formatAllergenNames(allergenIds: string[]): string {
  const allergenLabels = allergenIds.map(id => {
    const allergen = COMMON_ALLERGENS.find(a => a.id === id)
    return allergen?.label || id
  })
  
  if (allergenLabels.length === 0) return ''
  if (allergenLabels.length === 1) return allergenLabels[0]
  if (allergenLabels.length === 2) return allergenLabels.join(' and ')
  
  return allergenLabels.slice(0, -1).join(', ') + ', and ' + allergenLabels[allergenLabels.length - 1]
}

/**
 * Check if any allergies are configured
 */
export function hasAllergyRestrictions(): boolean {
  const prefs = getAllergyPreferences()
  return prefs.allergens.length > 0
}
