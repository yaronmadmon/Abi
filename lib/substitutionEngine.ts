/**
 * Smart Ingredient Substitution Engine
 * AI-powered substitution suggestions that respect allergies
 */

import { getAllergyPreferences } from './allergyManager'

export interface SubstitutionOption {
  name: string
  description: string
  ingredients: string[]
  steps: string[]
  flavorNote?: string
  allergens: string[]
}

export interface SubstitutionResult {
  original: string
  alternatives: SubstitutionOption[]
  safetyNote?: string
}

/**
 * Get AI-powered ingredient substitution suggestions
 * CRITICAL: Must respect household allergies
 */
export async function getSubstitutionSuggestions(
  missingIngredient: string,
  recipeContext: string,
  availableIngredients: string[] = []
): Promise<SubstitutionResult> {
  const allergyPrefs = getAllergyPreferences()
  const householdAllergens = allergyPrefs.allergens

  try {
    const response = await fetch('/api/ai/substitute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missingIngredient,
        recipeContext,
        availableIngredients,
        avoidAllergens: householdAllergens,
      })
    })

    if (!response.ok) {
      throw new Error('Substitution request failed')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Substitution error:', error)
    
    // Fallback to basic substitutions
    return getBasicSubstitution(missingIngredient, householdAllergens)
  }
}

/**
 * Fallback: Basic substitutions without AI
 * Still respects allergies
 */
function getBasicSubstitution(ingredient: string, avoidAllergens: string[]): SubstitutionResult {
  const lower = ingredient.toLowerCase()
  
  // Common substitutions database
  const substitutions: Record<string, SubstitutionOption[]> = {
    'bbq sauce': [
      {
        name: 'Homemade BBQ Sauce',
        description: 'Quick pantry BBQ sauce',
        ingredients: ['ketchup', 'brown sugar', 'vinegar', 'worcestershire sauce', 'garlic powder', 'onion powder'],
        steps: [
          'Mix 1 cup ketchup, 1/4 cup brown sugar, 2 tbsp vinegar',
          'Add 1 tbsp worcestershire, 1 tsp garlic powder, 1 tsp onion powder',
          'Simmer 10 minutes, stirring occasionally'
        ],
        flavorNote: 'Similar to store-bought, slightly sweeter',
        allergens: []
      }
    ],
    'soy sauce': [
      {
        name: 'Salt + Worcestershire Mix',
        description: 'Umami-rich alternative',
        ingredients: ['worcestershire sauce', 'salt', 'water'],
        steps: [
          'Mix 2 parts worcestershire sauce with 1 part water',
          'Add a pinch of salt to taste'
        ],
        flavorNote: 'Less salty, more tangy',
        allergens: avoidAllergens.includes('gluten') ? ['gluten'] : []
      }
    ],
    'butter': [
      {
        name: 'Oil Substitute',
        description: 'Neutral oil for cooking',
        ingredients: ['vegetable oil', 'olive oil', 'or coconut oil'],
        steps: [
          'Use 3/4 cup oil for every 1 cup butter',
          'Works best in baking and sautéing'
        ],
        flavorNote: 'Less rich flavor',
        allergens: []
      }
    ],
    'milk': [
      {
        name: 'Water + Butter',
        description: 'Simple milk substitute',
        ingredients: ['water', 'butter'],
        steps: [
          'Use equal amount of water',
          'Add 1 tbsp butter per cup for richness'
        ],
        flavorNote: 'Less creamy',
        allergens: avoidAllergens.includes('dairy') ? ['dairy'] : []
      }
    ],
    'egg': [
      {
        name: 'Flax Egg',
        description: 'Vegan egg substitute',
        ingredients: ['ground flaxseed', 'water'],
        steps: [
          'Mix 1 tbsp ground flaxseed with 3 tbsp water',
          'Let sit 5 minutes until gelatinous'
        ],
        flavorNote: 'Works in baking, nutty flavor',
        allergens: []
      }
    ]
  }

  // Find matching substitutions
  for (const [key, options] of Object.entries(substitutions)) {
    if (lower.includes(key)) {
      // Filter out options that contain household allergens
      const safeOptions = options.filter(option => {
        return !option.allergens.some(a => avoidAllergens.includes(a))
      })

      return {
        original: ingredient,
        alternatives: safeOptions,
        safetyNote: safeOptions.length < options.length 
          ? 'Some substitutions were excluded due to your allergy settings'
          : undefined
      }
    }
  }

  // No substitution found
  return {
    original: ingredient,
    alternatives: [],
    safetyNote: 'No safe substitutions found. Consider adding to shopping list.'
  }
}

/**
 * Validate substitution against allergies
 */
export function isSubstitutionSafe(substitution: SubstitutionOption, householdAllergens: string[]): boolean {
  if (householdAllergens.length === 0) return true
  if (substitution.allergens.length === 0) return true
  
  return !substitution.allergens.some(allergen => householdAllergens.includes(allergen))
}
