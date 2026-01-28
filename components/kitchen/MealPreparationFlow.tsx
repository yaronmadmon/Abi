'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChefHat, Check, ArrowRight, X } from 'lucide-react'
import { RECIPE_DATABASE } from '@/data/recipeDatabase'
import type { Recipe } from '@/data/recipeDatabase'

type MealType = 'breakfast' | 'lunch' | 'dinner'
type ProteinOption = 'chicken' | 'beef' | 'fish' | 'pork' | 'eggs' | 'vegetarian'

interface MealPreparationFlowProps {
  onComplete: (meal: any) => void
  onCancel: () => void
  initialMealType?: MealType
}

const PROTEIN_OPTIONS: { value: ProteinOption; label: string; emoji: string }[] = [
  { value: 'chicken', label: 'Chicken', emoji: '🍗' },
  { value: 'beef', label: 'Beef', emoji: '🥩' },
  { value: 'fish', label: 'Fish', emoji: '🐟' },
  { value: 'pork', label: 'Pork', emoji: '🥓' },
  { value: 'eggs', label: 'Eggs', emoji: '🥚' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
]

const MEAL_TYPE_CONFIG = {
  breakfast: { label: 'Breakfast', emoji: '🍳', color: 'from-yellow-400 to-yellow-500' },
  lunch: { label: 'Lunch', emoji: '🥪', color: 'from-green-400 to-green-500' },
  dinner: { label: 'Dinner', emoji: '🍽️', color: 'from-blue-400 to-blue-500' },
}

export default function MealPreparationFlow({ 
  onComplete, 
  onCancel,
  initialMealType 
}: MealPreparationFlowProps) {
  const [step, setStep] = useState<'type' | 'protein' | 'recipes'>(
    initialMealType ? 'protein' : 'type'
  )
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    initialMealType || null
  )
  const [selectedProtein, setSelectedProtein] = useState<ProteinOption | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Debug logging and scroll to top on step change
  useEffect(() => {
    console.log('MealPreparationFlow - Step:', step, 'MealType:', selectedMealType, 'Protein:', selectedProtein)
    // Scroll to top when step changes to ensure visibility
    if (typeof window !== 'undefined') {
      const modalContainer = document.querySelector('[class*="max-w-2xl"]')
      if (modalContainer) {
        modalContainer.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [step, selectedMealType, selectedProtein])

  // Filter recipes based on meal type and protein preference
  const getFilteredRecipes = (): Recipe[] => {
    if (!selectedMealType) return []
    
    let recipes = RECIPE_DATABASE.filter(r => r.mealType === selectedMealType)
    
    if (selectedProtein) {
      // Filter by protein preference
      const proteinKeywords: Record<ProteinOption, string[]> = {
        chicken: ['chicken', 'poultry'],
        beef: ['beef', 'steak', 'ground beef', 'hamburger'],
        fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'seafood'],
        pork: ['pork', 'bacon', 'ham', 'sausage'],
        eggs: ['egg', 'eggs'],
        vegetarian: [] // No meat keywords
      }
      
      if (selectedProtein === 'vegetarian') {
        // Exclude recipes with meat keywords
        const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'sausage', 'turkey', 'ham']
        recipes = recipes.filter(r => {
          const titleLower = r.title.toLowerCase()
          const descLower = r.description.toLowerCase()
          const ingredientsText = r.ingredients.map(i => i.name.toLowerCase()).join(' ')
          const allText = `${titleLower} ${descLower} ${ingredientsText}`
          return !meatKeywords.some(keyword => allText.includes(keyword))
        })
      } else {
        // Include recipes with matching protein keywords
        const keywords = proteinKeywords[selectedProtein]
        recipes = recipes.filter(r => {
          const titleLower = r.title.toLowerCase()
          const descLower = r.description.toLowerCase()
          const ingredientsText = r.ingredients.map(i => i.name.toLowerCase()).join(' ')
          const allText = `${titleLower} ${descLower} ${ingredientsText}`
          return keywords.some(keyword => allText.includes(keyword))
        })
      }
    }
    
    // Limit to 6 recipes for display
    return recipes.slice(0, 6)
  }

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    
    // Convert recipe to meal format and complete
    const day = new Date().toISOString().split('T')[0] // Today by default
    const meal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipeId: recipe.id,
      date: day,
      mealType: recipe.mealType,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: recipe.prepTime,
      tags: recipe.tags,
    }
    
    onComplete(meal)
  }

  const filteredRecipes = getFilteredRecipes()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Prepare a Meal</h2>
            <p className="text-sm text-gray-500">
              {step === 'type' && 'Choose meal type'}
              {step === 'protein' && 'Select protein preference'}
              {step === 'recipes' && 'Pick a recipe'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Step 1: Meal Type Selection */}
      {step === 'type' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.keys(MEAL_TYPE_CONFIG) as MealType[]).map(type => {
              const config = MEAL_TYPE_CONFIG[type]
              const isSelected = selectedMealType === type
              return (
                <button
                  key={type}
                  onClick={() => {
                    // Set meal type and advance to protein selection
                    console.log('Meal type selected:', type, '- Advancing to protein step')
                    setSelectedMealType(type)
                    setStep('protein')
                  }}
                  className={`relative p-6 rounded-2xl border-3 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-br ' + config.color + ' text-white shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-4xl mb-3">{config.emoji}</div>
                  <div className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {config.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Protein Selection */}
      {step === 'protein' && selectedMealType && (
        <div key="protein-step" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What protein would you like?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll suggest recipes based on your preference and what you have available
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROTEIN_OPTIONS.map(option => {
              const isSelected = selectedProtein === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedProtein(option.value)
                    setStep('recipes')
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-900'}`}>
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setStep('type')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to meal type
          </button>
        </div>
      )}

      {/* Step 3: Recipe Selection */}
      {step === 'recipes' && selectedMealType && selectedProtein && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Choose a Recipe
            </h3>
            <p className="text-sm text-gray-600">
              {filteredRecipes.length > 0 
                ? `Found ${filteredRecipes.length} recipe${filteredRecipes.length > 1 ? 's' : ''} matching your preferences`
                : 'No recipes found. Try a different protein option.'}
            </p>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left bg-white"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {recipe.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{recipe.prepTime} min</span>
                        <span>•</span>
                        <span>{recipe.ingredients.length} ingredients</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No recipes found for this combination.</p>
              <button
                onClick={() => setStep('protein')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                ← Try a different protein
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('protein')}
              className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
