/**
 * Measurement Converter for Cooking
 * Accurate conversions with ingredient-specific handling
 */

export interface Conversion {
  value: number
  unit: string
  label: string
}

export interface ConversionResult {
  original: string
  conversions: Conversion[]
  ingredient?: string
}

// Common ingredient densities (g/cup)
const INGREDIENT_DENSITIES: Record<string, number> = {
  'flour': 120,
  'all-purpose flour': 120,
  'sugar': 200,
  'granulated sugar': 200,
  'brown sugar': 220,
  'butter': 227,
  'oil': 218,
  'vegetable oil': 218,
  'olive oil': 216,
  'milk': 244,
  'water': 236,
  'honey': 340,
  'salt': 292,
  'rice': 185,
  'oats': 90,
}

// Standard conversions
const VOLUME_TO_ML: Record<string, number> = {
  'cup': 236.588,
  'cups': 236.588,
  'tbsp': 14.787,
  'tablespoon': 14.787,
  'tablespoons': 14.787,
  'tsp': 4.929,
  'teaspoon': 4.929,
  'teaspoons': 4.929,
  'fl oz': 29.574,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
}

const WEIGHT_TO_GRAMS: Record<string, number> = {
  'oz': 28.35,
  'ounce': 28.35,
  'ounces': 28.35,
  'lb': 453.592,
  'pound': 453.592,
  'pounds': 453.592,
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
}

/**
 * Parse a measurement string like "2 cups" or "8 oz"
 */
export function parseMeasurement(text: string): { value: number; unit: string; ingredient?: string } | null {
  // Match patterns like: "2 cups flour", "8 oz", "1/2 cup"
  const pattern = /(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]+)(?:\s+(.+))?/i
  const match = text.trim().match(pattern)
  
  if (!match) return null
  
  // Parse fraction or decimal
  let value = 0
  if (match[1].includes('/')) {
    const [num, denom] = match[1].split('/').map(Number)
    value = num / denom
  } else {
    value = parseFloat(match[1])
  }
  
  return {
    value,
    unit: match[2].toLowerCase(),
    ingredient: match[3]?.toLowerCase().trim()
  }
}

/**
 * Convert a measurement to multiple equivalent units
 */
export function convertMeasurement(text: string): ConversionResult | null {
  const parsed = parseMeasurement(text)
  if (!parsed) return null
  
  const { value, unit, ingredient } = parsed
  const conversions: Conversion[] = []
  
  // Check if it's a volume measurement
  if (VOLUME_TO_ML[unit]) {
    const ml = value * VOLUME_TO_ML[unit]
    
    // Add metric volumes
    if (ml >= 1000) {
      conversions.push({
        value: Math.round(ml / 1000 * 100) / 100,
        unit: 'L',
        label: 'liters'
      })
    } else {
      conversions.push({
        value: Math.round(ml),
        unit: 'ml',
        label: 'milliliters'
      })
    }
    
    // Add US customary volumes
    if (unit !== 'cup' && unit !== 'cups') {
      const cups = ml / VOLUME_TO_ML['cup']
      if (cups >= 0.125) {
        conversions.push({
          value: Math.round(cups * 8) / 8, // Round to nearest 1/8
          unit: 'cups',
          label: 'cups'
        })
      }
    }
    
    if (unit !== 'tbsp' && unit !== 'tablespoon' && unit !== 'tablespoons') {
      const tbsp = ml / VOLUME_TO_ML['tbsp']
      if (tbsp >= 0.5 && tbsp <= 16) {
        conversions.push({
          value: Math.round(tbsp * 2) / 2, // Round to nearest 0.5
          unit: 'tbsp',
          label: 'tablespoons'
        })
      }
    }
    
    // If we have an ingredient, try to convert to weight
    if (ingredient) {
      const density = getIngredientDensity(ingredient)
      if (density) {
        const cupsValue = ml / VOLUME_TO_ML['cup']
        const grams = cupsValue * density
        
        conversions.push({
          value: Math.round(grams),
          unit: 'g',
          label: `grams (${ingredient})`
        })
        
        const oz = grams / WEIGHT_TO_GRAMS['oz']
        if (oz >= 0.5) {
          conversions.push({
            value: Math.round(oz * 10) / 10,
            unit: 'oz',
            label: `ounces (${ingredient})`
          })
        }
      }
    }
  }
  
  // Check if it's a weight measurement
  else if (WEIGHT_TO_GRAMS[unit]) {
    const grams = value * WEIGHT_TO_GRAMS[unit]
    
    // Add metric weights
    if (grams >= 1000) {
      conversions.push({
        value: Math.round(grams / 1000 * 100) / 100,
        unit: 'kg',
        label: 'kilograms'
      })
    } else {
      conversions.push({
        value: Math.round(grams),
        unit: 'g',
        label: 'grams'
      })
    }
    
    // Add US customary weights
    if (unit !== 'oz' && unit !== 'ounce' && unit !== 'ounces') {
      const oz = grams / WEIGHT_TO_GRAMS['oz']
      conversions.push({
        value: Math.round(oz * 10) / 10,
        unit: 'oz',
        label: 'ounces'
      })
    }
    
    if (unit !== 'lb' && unit !== 'pound' && unit !== 'pounds') {
      const lb = grams / WEIGHT_TO_GRAMS['lb']
      if (lb >= 0.25) {
        conversions.push({
          value: Math.round(lb * 100) / 100,
          unit: 'lb',
          label: 'pounds'
        })
      }
    }
    
    // If we have an ingredient, try to convert to volume
    if (ingredient) {
      const density = getIngredientDensity(ingredient)
      if (density) {
        const cupsValue = grams / density
        
        if (cupsValue >= 0.125) {
          conversions.push({
            value: Math.round(cupsValue * 8) / 8,
            unit: 'cups',
            label: `cups (${ingredient})`
          })
        }
        
        const tbsp = cupsValue * 16 // 16 tbsp per cup
        if (tbsp >= 0.5 && tbsp <= 16) {
          conversions.push({
            value: Math.round(tbsp * 2) / 2,
            unit: 'tbsp',
            label: `tablespoons (${ingredient})`
          })
        }
      }
    }
  }
  
  if (conversions.length === 0) return null
  
  return {
    original: text,
    conversions,
    ingredient
  }
}

/**
 * Get ingredient density for volume/weight conversion
 */
function getIngredientDensity(ingredient: string): number | null {
  const normalized = ingredient.toLowerCase().trim()
  
  // Exact match
  if (INGREDIENT_DENSITIES[normalized]) {
    return INGREDIENT_DENSITIES[normalized]
  }
  
  // Partial match
  for (const [key, density] of Object.entries(INGREDIENT_DENSITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return density
    }
  }
  
  return null
}

/**
 * Check if a search query is a conversion request
 */
export function isConversionQuery(query: string): boolean {
  const conversionKeywords = ['to', 'in', 'convert', 'equals', '=']
  const lowerQuery = query.toLowerCase()
  
  return conversionKeywords.some(keyword => lowerQuery.includes(keyword)) &&
         (Object.keys(VOLUME_TO_ML).some(unit => lowerQuery.includes(unit)) ||
          Object.keys(WEIGHT_TO_GRAMS).some(unit => lowerQuery.includes(unit)))
}

/**
 * Handle conversion query from global search
 */
export function handleConversionQuery(query: string): ConversionResult | null {
  // Try to parse as a direct conversion query
  // Examples: "6 oz to cups", "450 grams in ounces", "1 cup butter grams"
  
  const lowerQuery = query.toLowerCase()
  
  // Extract the measurement part
  const pattern = /(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]+)(?:\s+(?:to|in|into|as|convert to))?\s*([a-zA-Z]+)?/i
  const match = query.match(pattern)
  
  if (!match) return null
  
  // Try converting the first part
  const measurement = `${match[1]} ${match[2]}`
  return convertMeasurement(measurement)
}

/**
 * Format conversion for display
 */
export function formatConversion(conversion: Conversion): string {
  return `≈ ${conversion.value} ${conversion.unit}`
}
