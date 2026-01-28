'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-3 transition-all duration-250" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading meals...</p>
        </div>
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
        <PageContainer>
          <Link href="/kitchen" className="inline-flex items-center gap-2 mb-6 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-5 h-5" />
            Back to Kitchen
          </Link>
          
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{formattedDate}</h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>No meals planned for this day</p>
            <button
              onClick={() => router.push('/kitchen/planner')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
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
        <Link href="/kitchen" className="inline-flex items-center gap-2 mb-6 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
          Back to Kitchen
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{formattedDate}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{meals.length} {meals.length === 1 ? 'meal' : 'meals'} planned</p>
        </div>

        {/* Meal Cards */}
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="rounded-2xl shadow-sm overflow-hidden transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
              {/* Meal Type Header */}
              <div className="px-6 py-3 flex items-center justify-between transition-all duration-250" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">{meal.mealType}</h3>
                  {meal.cooked && (
                    <span className="flex items-center gap-1 text-xs backdrop-blur-sm text-white px-2 py-1 rounded-full transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" />
                      Cooked
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAsCooked(meal.id)}
                    className="p-2 rounded-lg transition-all duration-250"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
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
                      className="text-xl font-bold transition-all duration-250 mb-2 block group"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                      {meal.title}
                      <BookOpen className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
                    </Link>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{meal.description}</p>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                <div className="rounded-xl p-4 mb-6 transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '1px solid var(--glass-border)' }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Ingredients Check</h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {meal.ingredients.length} ingredients needed for this recipe
                      </p>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        💡 Pantry integration coming soon - automatic ingredient checking
                      </div>
                    </div>
                  </div>
                </div>

                    {/* Quick Ingredient Preview with Substitution */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Key Ingredients:</h4>
                        <button
                          onClick={() => handleOpenSubstitution('example ingredient', meal)}
                          className="text-xs font-medium flex items-center gap-1 transition-colors duration-250"
                          style={{ color: 'var(--accent-primary)' }}
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
                            className="text-xs px-3 py-1.5 rounded-full transition-all duration-250 group"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(139, 158, 255, 0.1)'
                              e.currentTarget.style.color = 'var(--accent-primary)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                              e.currentTarget.style.color = 'var(--text-primary)'
                            }}
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
                          <span className="text-xs px-3 py-1.5 rounded-full transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            +{meal.ingredients.length - 6} more
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        💡 Click any ingredient to find a substitution
                      </p>
                    </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAddMissingToShopping(meal)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-250"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Shopping
                  </button>
                  <button
                    onClick={() => handleSwapRecipe(meal)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-250"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)'
                      e.currentTarget.style.color = 'var(--accent-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Swap Recipe
                  </button>
                  <button
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-250"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)', color: 'var(--error)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--error)'
                      e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                    }}
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
        <div className="mt-8 p-4 rounded-xl border transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
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
