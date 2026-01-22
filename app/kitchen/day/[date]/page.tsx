'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, Users, CheckCircle2, ShoppingCart, RefreshCw, Trash2, AlertCircle, BookOpen, Lightbulb } from 'lucide-react'
import SubstitutionModal from '@/components/kitchen/SubstitutionModal'
import PageContainer from '@/components/ui/PageContainer'

interface MealPlan {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'baking'
  title: string
  description: string
  imageUrl: string
  ingredients: { name: string; quantity: string }[]
  instructions?: string[]
  prepTime: number
  servings?: number
  cooked?: boolean
}

export default function MealDayViewPage() {
  const router = useRouter()
  const params = useParams()
  const date = params.date as string

  const [meals, setMeals] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [substitutionModal, setSubstitutionModal] = useState<{ ingredient: string; recipeTitle: string } | null>(null)

  useEffect(() => {
    loadMeals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const loadMeals = () => {
    try {
      const stored = localStorage.getItem('weeklyMeals')
      if (stored) {
        const allMeals = JSON.parse(stored)
        const dayMeals = allMeals.filter((m: MealPlan) => m.date === date)
        // Sort by meal type
        const mealTypeOrder = { breakfast: 1, lunch: 2, dinner: 3, baking: 4 }
        dayMeals.sort((a: MealPlan, b: MealPlan) => mealTypeOrder[a.mealType] - mealTypeOrder[b.mealType])
        setMeals(dayMeals)
      }
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMissingToShopping = async (meal: MealPlan) => {
    if (!confirm(`Add ${meal.ingredients.length} ingredients from "${meal.title}" to shopping list?`)) return

    try {
      const ingredientNames = meal.ingredients.map(ing => ing.name)
      
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

  const handleMarkAsCooked = (mealId: string) => {
    try {
      const stored = localStorage.getItem('weeklyMeals')
      if (stored) {
        const allMeals = JSON.parse(stored)
        const updated = allMeals.map((m: MealPlan) => 
          m.id === mealId ? { ...m, cooked: !m.cooked } : m
        )
        localStorage.setItem('weeklyMeals', JSON.stringify(updated))
        loadMeals()
        window.dispatchEvent(new Event('mealsUpdated'))
      }
    } catch (error) {
      console.error('Error marking meal:', error)
    }
  }

  const handleRemoveMeal = (mealId: string) => {
    if (!confirm('Remove this meal from your plan?')) return

    try {
      const stored = localStorage.getItem('weeklyMeals')
      if (stored) {
        const allMeals = JSON.parse(stored)
        const updated = allMeals.filter((m: MealPlan) => m.id !== mealId)
        localStorage.setItem('weeklyMeals', JSON.stringify(updated))
        window.dispatchEvent(new Event('mealsUpdated'))
        
        if (meals.length === 1) {
          // Last meal removed, go back
          router.push('/kitchen')
        } else {
          loadMeals()
        }
      }
    } catch (error) {
      console.error('Error removing meal:', error)
    }
  }

  const handleSwapRecipe = (meal: MealPlan) => {
    // Navigate to Recipe Library in SWAP MODE with full context
    const swapContext = {
      swap: 'true',
      day: date,
      mealType: meal.mealType,
      mealId: meal.id,
      returnTo: `/kitchen/day/${date}`
    }
    const params = new URLSearchParams(swapContext)
    router.push(`/kitchen/recipes?${params.toString()}`)
  }

  const handleOpenSubstitution = (ingredient: string, meal: MealPlan) => {
    setSubstitutionModal({
      ingredient,
      recipeTitle: meal.title
    })
  }

  const handleAddIngredientToShopping = async (ingredient: string) => {
    try {
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: [ingredient],
          category: 'recipe-ingredients'
        })
      })
      
      alert(`Added "${ingredient}" to shopping list`)
    } catch (error) {
      console.error('Error adding ingredient:', error)
      alert('Failed to add ingredient')
    }
  }

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }) : ''

  const mealTypeColors = {
    breakfast: 'from-yellow-500 to-orange-500',
    lunch: 'from-green-500 to-emerald-500',
    dinner: 'from-blue-500 to-indigo-500',
    baking: 'from-pink-500 to-rose-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 page-with-bottom-nav flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading meals...</p>
        </div>
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
        <PageContainer>
          <Link href="/kitchen" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
            <ChevronLeft className="w-5 h-5" />
            Back to Kitchen
          </Link>
          
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{formattedDate}</h1>
            <p className="text-gray-500 mb-6">No meals planned for this day</p>
            <button
              onClick={() => router.push('/kitchen/planner')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Plan Meals
            </button>
          </div>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        {/* Header */}
        <Link href="/kitchen" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Kitchen
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formattedDate}</h1>
          <p className="text-gray-600">{meals.length} {meals.length === 1 ? 'meal' : 'meals'} planned</p>
        </div>

        {/* Meal Cards */}
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
              {/* Meal Type Header */}
              <div className={`bg-gradient-to-r ${mealTypeColors[meal.mealType]} px-6 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">{meal.mealType}</h3>
                  {meal.cooked && (
                    <span className="flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Cooked
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAsCooked(meal.id)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title={meal.cooked ? 'Mark as uncooked' : 'Mark as cooked'}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${meal.cooked ? 'text-white' : 'text-white/70'}`} />
                  </button>
                </div>
              </div>

              {/* Meal Content */}
              <div className="p-6">
                {/* Recipe Image & Title */}
                <div className="flex gap-4 mb-6">
                  <div className="w-32 h-32 relative flex-shrink-0 rounded-xl overflow-hidden">
                    <Image
                      src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={meal.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/kitchen/recipes?recipe=${meal.id}`}
                      className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors mb-2 block group"
                    >
                      {meal.title}
                      <BookOpen className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meal.prepTime} min
                      </div>
                      {meal.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Serves {meal.servings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Readiness Check */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Ingredients Check</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {meal.ingredients.length} ingredients needed for this recipe
                      </p>
                      <div className="text-xs text-gray-500">
                        💡 Pantry integration coming soon - automatic ingredient checking
                      </div>
                    </div>
                  </div>
                </div>

                    {/* Quick Ingredient Preview with Substitution */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">Key Ingredients:</h4>
                        <button
                          onClick={() => handleOpenSubstitution('example ingredient', meal)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          <Lightbulb className="w-3 h-3" />
                          Find Substitutes
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meal.ingredients.slice(0, 6).map((ing, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOpenSubstitution(ing.name, meal)}
                            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-full transition-colors group"
                            title="Click to find substitute"
                          >
                            <span className="group-hover:hidden">{ing.name}</span>
                            <span className="hidden group-hover:inline flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 inline" />
                              {ing.name}
                            </span>
                          </button>
                        ))}
                        {meal.ingredients.length > 6 && (
                          <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full">
                            +{meal.ingredients.length - 6} more
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Click any ingredient to find a substitution
                      </p>
                    </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAddMissingToShopping(meal)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Shopping
                  </button>
                  <button
                    onClick={() => handleSwapRecipe(meal)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 rounded-xl font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Swap Recipe
                  </button>
                  <button
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-red-600 hover:border-red-500 hover:bg-red-50 rounded-xl font-semibold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove from Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Tip:</strong> Click the recipe title to view full cooking instructions and ingredients
          </p>
        </div>

        {/* Substitution Modal */}
        {substitutionModal && (
          <SubstitutionModal
            missingIngredient={substitutionModal.ingredient}
            recipeTitle={substitutionModal.recipeTitle}
            onClose={() => setSubstitutionModal(null)}
            onAddToShopping={() => {
              handleAddIngredientToShopping(substitutionModal.ingredient)
              setSubstitutionModal(null)
            }}
          />
        )}
      </PageContainer>
    </div>
  )
}
