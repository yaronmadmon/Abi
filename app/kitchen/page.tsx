'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed, ShoppingCart, Sparkles, Clock, ChefHat, ArrowRight, BookOpen, Trash2, Shield } from 'lucide-react'
import SummaryCard from '@/components/section/SummaryCard'
import Link from 'next/link'
import type { Meal, ShoppingItem } from '@/types/home'
import { RECIPE_DATABASE } from '@/data/recipeDatabase'
import { getAllergyPreferences, formatAllergenNames } from '@/lib/allergyManager'
import { getCalendarPreferences, formatInCalendar, getCalendarSystem } from '@/lib/calendarSystems'
import PageContainer from '@/components/ui/PageContainer'

export default function KitchenPage() {
  const router = useRouter()
  const [weeklyMeals, setWeeklyMeals] = useState<any[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [showAddIngredientsPrompt, setShowAddIngredientsPrompt] = useState(false)
  const [likedRecipesCount, setLikedRecipesCount] = useState(0)
  const [householdAllergens, setHouseholdAllergens] = useState<string[]>([])
  const [calendarPrefs, setCalendarPrefs] = useState(getCalendarPreferences())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedMeals = localStorage.getItem('weeklyMeals')
    const storedShopping = localStorage.getItem('shoppingItems')
    const storedLiked = localStorage.getItem('likedRecipes')

    if (storedMeals) {
      try {
        const meals = JSON.parse(storedMeals)
        console.log('📅 Loaded meals from localStorage:', meals.length, 'meals')
        setWeeklyMeals(meals)
      } catch (error) {
        console.error('Failed to parse weeklyMeals:', error)
        setWeeklyMeals([])
      }
    } else {
      setWeeklyMeals([])
    }

    if (storedShopping) {
      setShoppingItems(JSON.parse(storedShopping))
    }

    if (storedLiked) {
      setLikedRecipesCount(JSON.parse(storedLiked).length)
    }
    
    const allergyPrefs = getAllergyPreferences()
    setHouseholdAllergens(allergyPrefs.allergens)
  }


  // Refresh data when meals are updated
  useEffect(() => {
    const handleMealsUpdate = () => {
      console.log('🔄 mealsUpdated event received, reloading data...')
      loadData()
    }
    const handleAllergyUpdate = () => {
      const allergyPrefs = getAllergyPreferences()
      setHouseholdAllergens(allergyPrefs.allergens)
    }
    const handleCalendarUpdate = () => {
      setCalendarPrefs(getCalendarPreferences())
    }
    window.addEventListener('mealsUpdated', handleMealsUpdate)
    window.addEventListener('allergiesUpdated', handleAllergyUpdate)
    window.addEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
    return () => {
      window.removeEventListener('mealsUpdated', handleMealsUpdate)
      window.removeEventListener('allergiesUpdated', handleAllergyUpdate)
      window.removeEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
    }
  }, [])

  // Derive today's meals from weekly meals
  const today = new Date().toISOString().split('T')[0]
  const todayMeals = weeklyMeals.filter(m => m.date === today)

  // Group meals by date for weekly view
  const mealsByDate: Record<string, any[]> = {}
  weeklyMeals.forEach(meal => {
    if (!mealsByDate[meal.date]) {
      mealsByDate[meal.date] = []
    }
    mealsByDate[meal.date].push(meal)
  })

  const pendingShopping = shoppingItems.filter((item) => !item.completed).slice(0, 3)

  const handleAddTodayIngredients = async () => {
    if (todayMeals.length === 0) return
    
    setShowAddIngredientsPrompt(false)
    
    try {
      // Collect all ingredients from today's meals
      const allIngredients = todayMeals.flatMap(meal => 
        meal.ingredients.map((ing: any) => ing.name.toLowerCase().trim())
      )
      
      // Remove duplicates
      const uniqueIngredients = Array.from(new Set(allIngredients))
      
      // Add to shopping list
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: uniqueIngredients,
          category: "Today's Meal – Ingredients"
        })
      })
      
      // Show success feedback
      alert(`Added ${uniqueIngredients.length} ingredients to shopping list`)
      loadData() // Refresh shopping list
    } catch (error) {
      console.error('Error adding ingredients:', error)
      alert('Failed to add ingredients')
    }
  }

  const handleClearAllMeals = () => {
    if (!confirm('Are you sure you want to clear ALL meals from your weekly plan? This cannot be undone.')) return
    
    try {
      localStorage.setItem('weeklyMeals', JSON.stringify([]))
      setWeeklyMeals([])
      
      // Trigger update event
      window.dispatchEvent(new Event('mealsUpdated'))
      
      alert('All meals cleared successfully')
    } catch (error) {
      console.error('Error clearing meals:', error)
      alert('Failed to clear meals')
    }
  }

  const handleDayClick = (dayDate: string) => {
    // Navigate to Meal Day View page
    router.push(`/kitchen/day/${dayDate}`)
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const getDayDate = (dayIndex: number) => {
    const date = new Date()
    const currentDay = date.getDay()
    const diff = dayIndex - currentDay
    date.setDate(date.getDate() + diff)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Kitchen</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recipes, groceries & pantry</p>
        </div>

        {/* Allergy Banner */}
        {householdAllergens.length > 0 && (
          <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '2px solid rgba(248, 113, 113, 0.3)' }}>
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Allergy-Safe Mode</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Avoiding: {formatAllergenNames(householdAllergens)}
                </p>
              </div>
              <Link
                href="/kitchen/settings/allergies"
                className="text-sm font-medium transition-colors duration-250"
                style={{ color: 'var(--error)' }}
              >
                Edit
              </Link>
            </div>
          </div>
        )}

        {/* No Allergies Set - Prompt */}
        {householdAllergens.length === 0 && (
          <Link href="/kitchen/settings/allergies" className="block mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">Set Household Allergies</h3>
                  <p className="text-sm text-blue-800">
                    Configure dietary restrictions to filter recipes safely →
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Summary Cards */}
        <div className="space-y-4 mb-6">
          {/* 1. Today's Meal (Read-only, derived from weekly) */}
          <div className="rounded-lg p-6 shadow-sm transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Meal</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {todayMeals.length === 0 ? 'No meals planned' : `${todayMeals.length} planned`}
                </p>
              </div>
            </div>

            {todayMeals.length > 0 ? (
              <>
                <div className="space-y-4 mb-4">
                  {todayMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => {
                        // Navigate to recipe detail if recipeId exists
                        if (meal.recipeId) {
                          router.push(`/kitchen/recipes/${meal.recipeId}`)
                        } else {
                          // Fallback: try to find recipe by title in database
                          const recipe = RECIPE_DATABASE.find(r => r.title === meal.title)
                          if (recipe) {
                            router.push(`/kitchen/recipes/${recipe.id}`)
                          }
                        }
                      }}
                      className="w-full flex gap-4 p-3 rounded-lg transition-all duration-250 cursor-pointer text-left"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    >
                      <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden">
                        <Image 
                          src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                          alt={meal.title} 
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--accent-primary)' }}>
                          {meal.mealType}
                        </div>
                        <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{meal.title}</h4>
                        <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{meal.description}</p>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.prepTime} min
                          </div>
                          <div>Serves 4</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Optional Action: Add Ingredients */}
                <button
                  onClick={() => setShowAddIngredientsPrompt(true)}
                  className="w-full py-2.5 px-4 text-sm rounded-lg transition-all duration-250 font-medium"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                >
                  Add today's ingredients to shopping list
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No meals planned for today</p>
                <button
                  onClick={() => router.push('/kitchen/planner')}
                  className="text-sm font-medium transition-colors duration-250"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Plan with Abby →
                </button>
              </div>
            )}
          </div>

          {/* 2. Recipe Library (Browse & Discovery) */}
          <button
            onClick={() => router.push('/kitchen/recipes')}
            className="w-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Browse Recipes</h3>
                  <p className="text-sm text-purple-100">
                    {RECIPE_DATABASE.length}+ recipes {likedRecipesCount > 0 && `• ${likedRecipesCount} liked`}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white/80" strokeWidth={2} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-purple-100 mb-1">Breakfast</div>
                <div className="text-sm font-semibold">{RECIPE_DATABASE.filter(r => r.mealType === 'breakfast').length}</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-purple-100 mb-1">Lunch</div>
                <div className="text-sm font-semibold">{RECIPE_DATABASE.filter(r => r.mealType === 'lunch').length}</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-purple-100 mb-1">Dinner</div>
                <div className="text-sm font-semibold">{RECIPE_DATABASE.filter(r => r.mealType === 'dinner').length}</div>
              </div>
            </div>
          </button>

          {/* 3. Meal Planner (Primary CTA) */}
          <button
            onClick={() => router.push('/kitchen/planner')}
            className="w-full rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-250 text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">What's for Dinner?</h3>
                  <p className="text-sm text-orange-100">Let Abby design your week</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white/80" strokeWidth={2} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-orange-100 mb-1">Quick</div>
                <div className="text-sm font-semibold">Under 60s</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-orange-100 mb-1">Smart</div>
                <div className="text-sm font-semibold">Uses leftovers</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs text-orange-100 mb-1">Complete</div>
                <div className="text-sm font-semibold">Auto-shop list</div>
              </div>
            </div>
          </button>

          {/* 4. This Week's Meals (Clickable cards) */}
          <div className="rounded-lg p-6 shadow-sm transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>This Week's Meals</h3>
              {weeklyMeals.length > 0 && (
                <button
                  onClick={handleClearAllMeals}
                  className="text-sm font-medium flex items-center gap-1 transition-colors duration-250"
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-2 min-w-max pb-2">
                {dayLabels.map((day, index) => {
                  const dayDate = getDayDate(index === 0 ? 7 : index) // Adjust for Mon=1, Sun=0
                  const dayMeals = mealsByDate[dayDate] || []
                  const isToday = dayDate === today
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(dayDate)}
                      className="flex-shrink-0 w-[100px] p-3 rounded-lg border-2 transition-all duration-250 hover:shadow-md cursor-pointer"
                      style={{
                        border: isToday ? '2px solid var(--accent-primary)' : dayMeals.length > 0 ? '2px solid var(--glass-border)' : '2px solid var(--glass-border)',
                        backgroundColor: isToday ? 'rgba(139, 158, 255, 0.1)' : dayMeals.length > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.05)'
                      }}
                    >
                      <h4 className="text-xs font-medium mb-2 text-center" style={{ color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {day}
                      </h4>
                      {dayMeals.length > 0 ? (
                        <div className="space-y-1">
                          {dayMeals.slice(0, 2).map((meal) => (
                            <div key={meal.id} className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                              {meal.title.split(' ')[0]}
                            </div>
                          ))}
                          {dayMeals.length > 2 && (
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>+{dayMeals.length - 2}</div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>-</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 5. Shopping List */}
          <SummaryCard
            title="Shopping List"
            subtitle={`${pendingShopping.length} items`}
            icon={ShoppingCart}
            href="/dashboard/shopping"
          >
            {pendingShopping.length > 0 ? (
              <div className="space-y-2">
                {pendingShopping.map((item) => (
                  <div key={item.id} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    • {item.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your shopping list is empty. Ready to add some items?</p>
            )}
          </SummaryCard>
        </div>

        {/* Add Ingredients Confirmation Prompt */}
        {showAddIngredientsPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="rounded-lg max-w-md w-full p-6 shadow-2xl transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Add ingredients to shopping list?
              </h3>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Today's Meal – Ingredients</p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {todayMeals.length === 1 
                  ? `${todayMeals[0].ingredients.length} ingredients from ${todayMeals[0].title}`
                  : `All ingredients from ${todayMeals.length} meals`}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddTodayIngredients}
                  className="w-full py-3 px-4 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-250"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Add to shopping list
                </button>
                <button
                  onClick={() => setShowAddIngredientsPrompt(false)}
                  className="w-full py-3 px-4 font-medium transition-colors duration-250"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}

      </PageContainer>
    </div>
  )
}
