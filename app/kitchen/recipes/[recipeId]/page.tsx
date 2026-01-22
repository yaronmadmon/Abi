'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, Users, Heart, ShoppingCart, Check, AlertTriangle, Shield } from 'lucide-react'
import { RECIPE_DATABASE, Recipe } from '@/data/recipeDatabase'
import { getAllergyPreferences, isRecipeSafe, getConflictingAllergens, formatAllergenNames } from '@/lib/allergyManager'
import MeasurementConverter from '@/components/kitchen/MeasurementConverter'
import PageContainer from '@/components/ui/PageContainer'

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const recipeId = params.recipeId as string

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [likedRecipes, setLikedRecipes] = useState<string[]>([])
  const [householdAllergens, setHouseholdAllergens] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // Swap mode context (if navigated from swap)
  const [swapMode, setSwapMode] = useState<{
    active: boolean
    day: string
    mealType: string
    mealId: string
    returnTo: string
  } | null>(null)

  useEffect(() => {
    // Load recipe
    const foundRecipe = RECIPE_DATABASE.find(r => r.id === recipeId)
    setRecipe(foundRecipe || null)
    
    // Load liked recipes
    const stored = localStorage.getItem('likedRecipes')
    if (stored) {
      setLikedRecipes(JSON.parse(stored))
    }
    
    // Load allergy preferences
    const allergyPrefs = getAllergyPreferences()
    setHouseholdAllergens(allergyPrefs.allergens)
    
    // Check for swap mode
    if (searchParams) {
      const isSwap = searchParams.get('swap') === 'true'
      if (isSwap) {
        setSwapMode({
          active: true,
          day: searchParams.get('day') || '',
          mealType: searchParams.get('mealType') || '',
          mealId: searchParams.get('mealId') || '',
          returnTo: searchParams.get('returnTo') || '/kitchen'
        })
      }
    }
    
    setLoading(false)
  }, [recipeId, searchParams])

  const handleLikeRecipe = () => {
    if (!recipe) return
    
    const updated = likedRecipes.includes(recipe.id)
      ? likedRecipes.filter(id => id !== recipe.id)
      : [...likedRecipes, recipe.id]
    
    setLikedRecipes(updated)
    localStorage.setItem('likedRecipes', JSON.stringify(updated))
  }

  const handleAddToShoppingList = async () => {
    if (!recipe) return
    if (!confirm(`Add ${recipe.ingredients.length} ingredients from "${recipe.title}" to shopping list?`)) return

    try {
      const ingredientNames = recipe.ingredients.map((ing) => ing.name)
      
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: ingredientNames,
          category: 'recipe-ingredients'
        })
      })
      
      alert(`Added ${ingredientNames.length} ingredients to shopping list`)
    } catch (error) {
      console.error('Error adding ingredients:', error)
      alert('Failed to add ingredients')
    }
  }

  const handleReplaceMeal = () => {
    if (!recipe || !swapMode) return
    
    try {
      const stored = localStorage.getItem('weeklyMeals')
      if (!stored) return
      
      const allMeals = JSON.parse(stored)
      const updatedMeals = allMeals.map((m: any) => {
        if (m.id === swapMode.mealId) {
          return {
            ...m,
            title: recipe.title,
            description: recipe.description,
            imageUrl: recipe.imageUrl,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            prepTime: recipe.prepTime,
            servings: recipe.servings
          }
        }
        return m
      })
      
      localStorage.setItem('weeklyMeals', JSON.stringify(updatedMeals))
      window.dispatchEvent(new Event('mealsUpdated'))
      
      alert(`Meal replaced successfully!`)
      router.push(swapMode.returnTo)
    } catch (error) {
      console.error('Error replacing meal:', error)
      alert('Failed to replace meal')
    }
  }

  const getBackUrl = () => {
    if (swapMode?.active) {
      return '/kitchen/recipes?swap=true&day=' + swapMode.day + '&mealType=' + swapMode.mealType + '&mealId=' + swapMode.mealId + '&returnTo=' + swapMode.returnTo
    }
    return searchParams?.get('from') || '/kitchen/recipes'
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 page-with-bottom-nav flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
        <PageContainer>
          <button
            onClick={() => router.push('/kitchen/recipes')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Recipes
          </button>
          
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
            <p className="text-gray-500">The recipe you're looking for doesn't exist.</p>
          </div>
        </PageContainer>
      </div>
    )
  }

  const isLiked = likedRecipes.includes(recipe.id)
  const isSafe = isRecipeSafe(recipe.allergens || [], householdAllergens)
  const conflictingAllergens = getConflictingAllergens(recipe.allergens || [], householdAllergens)

  return (
    <div className="min-h-screen page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        {/* Hero Image */}
        <div className="relative w-full h-64 md:h-80 bg-gray-100">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          
          {/* Back Button Overlay */}
          <button
            onClick={() => router.push(getBackUrl())}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Like Button Overlay */}
          <button
            onClick={handleLikeRecipe}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isLiked
                ? 'bg-pink-500 hover:bg-pink-600'
                : 'bg-white/90 backdrop-blur-sm hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Swap Mode Banner */}
          {swapMode?.active && (
            <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-1">Ready to Swap</h3>
                  <p className="text-sm text-orange-800">
                    This will replace your {swapMode.mealType} on {new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Allergy Warning */}
          {householdAllergens.length > 0 && !isSafe && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1">Allergy Warning</h3>
                  <p className="text-sm text-red-800">
                    This recipe contains: {formatAllergenNames(conflictingAllergens)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recipe Header */}
          <div className="text-xs font-medium text-orange-600 uppercase mb-2">
            {recipe.mealType} • {recipe.cuisine} • {recipe.difficulty}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {recipe.title}
          </h1>
          <p className="text-gray-600 mb-6">{recipe.description}</p>

          {/* Recipe Metadata */}
          <div className="flex gap-6 mb-6 pb-6 border-b">
            <div className="text-center">
              <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-900">{recipe.totalTime} min</div>
              <div className="text-xs text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-900">{recipe.servings}</div>
              <div className="text-xs text-gray-500">Servings</div>
            </div>
            {recipe.calories && (
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{recipe.calories}</div>
                <div className="text-xs text-gray-500">Calories</div>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex gap-2 items-start text-base text-gray-700">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-1">•</span>
                  <span className="flex-1">
                    <span className="font-medium">{ing.quantity}</span> {ing.name}
                  </span>
                  <MeasurementConverter quantity={ing.quantity} ingredient={ing.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4 text-base text-gray-700">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 flex-wrap">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-4 py-2 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pb-8">
            {swapMode?.active ? (
              <>
                {/* Swap Mode Actions */}
                <button
                  onClick={handleReplaceMeal}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-6 h-6" />
                  Use This Recipe for {swapMode.mealType}
                </button>
                
                <button
                  onClick={handleLikeRecipe}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isLiked
                      ? 'bg-pink-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                  {isLiked ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>

                <button
                  onClick={() => router.push(getBackUrl())}
                  className="w-full py-3 px-4 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Back to Results
                </button>
              </>
            ) : (
              <>
                {/* Normal Browsing Actions */}
                <button
                  onClick={handleLikeRecipe}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isLiked
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
                  {isLiked ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>
                
                <button
                  onClick={handleAddToShoppingList}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add Ingredients to Shopping
                </button>
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
