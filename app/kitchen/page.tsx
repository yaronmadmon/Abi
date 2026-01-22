'use client'

import { useState, useEffect } from 'react'
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
      setWeeklyMeals(JSON.parse(storedMeals))
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
    const handleMealsUpdate = () => loadData()
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
            <ChefHat className="w-8 h-8 text-orange-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900">Kitchen</h1>
          </div>
          <p className="text-sm text-gray-500">Recipes, groceries & pantry</p>
        </div>

        {/* Allergy Banner */}
        {householdAllergens.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Allergy-Safe Mode</h3>
                <p className="text-sm text-red-800">
                  Avoiding: {formatAllergenNames(householdAllergens)}
                </p>
              </div>
              <Link
                href="/kitchen/settings/allergies"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
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
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Meal</h3>
                <p className="text-sm text-gray-500">
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
                      className="w-full flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
                    >
                      <img 
                        src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                        alt={meal.title} 
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-blue-600 uppercase mb-1">
                          {meal.mealType}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{meal.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{meal.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
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
                  className="w-full py-2.5 px-4 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Add today's ingredients to shopping list
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No meals planned for today</p>
                <button
                  onClick={() => router.push('/kitchen/planner')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
            className="w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
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
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week's Meals</h3>
              {weeklyMeals.length > 0 && (
                <button
                  onClick={handleClearAllMeals}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
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
                      className={`flex-shrink-0 w-[100px] p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                        isToday
                          ? 'border-blue-500 bg-blue-50'
                          : dayMeals.length > 0
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className={`text-xs font-medium mb-2 text-center ${
                        isToday ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {day}
                      </h4>
                      {dayMeals.length > 0 ? (
                        <div className="space-y-1">
                          {dayMeals.slice(0, 2).map((meal) => (
                            <div key={meal.id} className="text-xs text-gray-600 truncate">
                              {meal.title.split(' ')[0]}
                            </div>
                          ))}
                          {dayMeals.length > 2 && (
                            <div className="text-xs text-gray-400">+{dayMeals.length - 2}</div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center">-</p>
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
                  <div key={item.id} className="text-sm text-gray-700">
                    • {item.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Your shopping list is empty. Ready to add some items?</p>
            )}
          </SummaryCard>
        </div>

        {/* Add Ingredients Confirmation Prompt */}
        {showAddIngredientsPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Add ingredients to shopping list?
              </h3>
              <p className="text-sm text-gray-600 mb-1">Today's Meal – Ingredients</p>
              <p className="text-sm text-gray-500 mb-6">
                {todayMeals.length === 1 
                  ? `${todayMeals[0].ingredients.length} ingredients from ${todayMeals[0].title}`
                  : `All ingredients from ${todayMeals.length} meals`}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddTodayIngredients}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Add to shopping list
                </button>
                <button
                  onClick={() => setShowAddIngredientsPrompt(false)}
                  className="w-full py-3 px-4 text-gray-700 hover:text-gray-900 font-medium transition-colors"
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
