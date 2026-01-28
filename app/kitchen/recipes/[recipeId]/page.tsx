'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-3 transition-all duration-250" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading recipe...</p>
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
            className="inline-flex items-center gap-2 mb-6 transition-colors duration-250"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Recipes
          </button>
          
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Recipe Not Found</h1>
            <p style={{ color: 'var(--text-secondary)' }}>The recipe you're looking for doesn't exist.</p>
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
        <div className="relative w-full h-64 md:h-80" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            unoptimized
          />
          
          {/* Back Button Overlay */}
          <button
            onClick={() => router.push(getBackUrl())}
            className="absolute top-4 left-4 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-250 shadow-lg"
            style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.9)'}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Like Button Overlay */}
          <button
            onClick={handleLikeRecipe}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-250 shadow-lg"
            style={{
              backgroundColor: isLiked ? 'var(--accent-primary)' : 'rgba(17, 24, 39, 0.9)',
              color: isLiked ? 'white' : 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              if (!isLiked) {
                e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLiked) {
                e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.9)'
              }
            }}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Swap Mode Banner */}
          {swapMode?.active && (
            <div className="mb-6 rounded-2xl p-4 transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '2px solid var(--glass-border)' }}>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ready to Swap</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This will replace your {swapMode.mealType} on {new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Allergy Warning */}
          {householdAllergens.length > 0 && !isSafe && (
            <div className="mb-6 rounded-2xl p-4 transition-all duration-250" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '2px solid rgba(248, 113, 113, 0.3)' }}>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Allergy Warning</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This recipe contains: {formatAllergenNames(conflictingAllergens)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recipe Header */}
          <div className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--accent-primary)' }}>
            {recipe.mealType} • {recipe.cuisine} • {recipe.difficulty}
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {recipe.title}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{recipe.description}</p>

          {/* Recipe Metadata */}
          <div className="flex gap-6 mb-6 pb-6 border-b transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{recipe.totalTime} min</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Time</div>
            </div>
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{recipe.servings}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Servings</div>
            </div>
            {recipe.calories && (
              <div className="text-center">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{recipe.calories}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Calories</div>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex gap-2 items-start text-base" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-bold flex-shrink-0 mt-1" style={{ color: 'var(--accent-primary)' }}>•</span>
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
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4 text-base" style={{ color: 'var(--text-primary)' }}>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)', color: 'var(--accent-primary)' }}>
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
                    className="text-sm px-4 py-2 rounded-full transition-all duration-250"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
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
