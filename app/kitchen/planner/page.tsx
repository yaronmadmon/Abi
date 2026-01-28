'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Sparkles, Check, Calendar, ShoppingCart, Clock, ChefHat, BookOpen, Wand2, Trash2 } from 'lucide-react'
import { selectRecipesForPlan, Recipe } from '@/data/recipeDatabase'
import PageContainer from '@/components/ui/PageContainer'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'baking'
type TimeRange = 'day' | 'week' | 'custom'
type PlanningMode = 'curated' | 'ai'

interface GeneratedMeal {
  id: string
  recipeId?: string // Original recipe ID for reference
  date: string
  mealType: MealType
  title: string
  description: string
  imageUrl: string
  ingredients: { name: string; quantity: string }[]
  instructions?: string[]
  prepTime: number
  tags: string[]
  isLeftover?: boolean
  leftoverFrom?: string
}

type ProteinOption = 'chicken' | 'beef' | 'fish' | 'pork' | 'eggs' | 'vegetarian' | 'any'

const PROTEIN_OPTIONS: { value: ProteinOption; label: string; emoji: string }[] = [
  { value: 'any', label: 'Any Protein', emoji: '🍽️' },
  { value: 'chicken', label: 'Chicken', emoji: '🍗' },
  { value: 'beef', label: 'Beef', emoji: '🥩' },
  { value: 'fish', label: 'Fish', emoji: '🐟' },
  { value: 'pork', label: 'Pork', emoji: '🥓' },
  { value: 'eggs', label: 'Eggs', emoji: '🥚' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
]

export default function MealPlannerPage() {
  const router = useRouter()
  const [step, setStep] = useState<'mode' | 'type' | 'protein' | 'range' | 'planning' | 'results' | 'confirm'>('mode')
  const [planningMode, setPlanningMode] = useState<PlanningMode>('curated')
  const [selectedTypes, setSelectedTypes] = useState<MealType[]>(['dinner'])
  const [selectedProtein, setSelectedProtein] = useState<ProteinOption>('any')
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [customDays, setCustomDays] = useState(7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMeals, setGeneratedMeals] = useState<GeneratedMeal[]>([])
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  const mealTypeConfig = {
    breakfast: { label: 'Breakfast', emoji: '🍳', color: 'from-yellow-400 to-yellow-500' },
    lunch: { label: 'Lunch', emoji: '🥪', color: 'from-green-400 to-green-500' },
    dinner: { label: 'Dinner', emoji: '🍽️', color: 'from-blue-400 to-blue-500' },
    baking: { label: 'Baking', emoji: '🧁', color: 'from-pink-400 to-pink-500' },
  }

  const toggleMealType = (type: MealType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleDeleteMeal = (mealId: string) => {
    if (!confirm('Are you sure you want to remove this meal?')) return
    
    setGeneratedMeals(prev => prev.filter(meal => meal.id !== mealId))
  }

  const dayToDate = (day: string, offset: number = 0): string => {
    const dayMap: Record<string, number> = {
      mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
    }
    
    const today = new Date()
    const todayDay = today.getDay()
    const targetDay = dayMap[day]
    
    let daysToAdd = targetDay - todayDay + (offset * 7)
    if (daysToAdd < 0) daysToAdd += 7
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysToAdd)
    
    return targetDate.toISOString().split('T')[0]
  }

  const handleCreatePlan = async () => {
    setStep('planning')
    setIsGenerating(true)

    try {
      // Determine days to generate
      const days = timeRange === 'day' ? ['mon'] 
        : timeRange === 'week' ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        : Array.from({ length: customDays }, (_, i) => {
            const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            return dayNames[i % 7]
          })

      let meals: GeneratedMeal[]

      if (planningMode === 'curated') {
        // Use curated recipe database - get recipes for each meal type
        meals = []
        
        for (const mealType of selectedTypes) {
          const recipesForType = selectRecipesForPlan({
            mealTypes: [mealType],
            daysCount: days.length,
            cuisines: ['american', 'italian', 'asian', 'mexican'],
            preferences: ['family-friendly', 'quick'],
            quick: true
          })

          // Assign each recipe to a different day
          recipesForType.slice(0, days.length).forEach((recipe, dayIndex) => {
            const date = dayToDate(days[dayIndex])
            meals.push({
              id: `meal-${recipe.id}-${date}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              recipeId: recipe.id, // Keep original recipe ID for reference
              date,
              mealType: recipe.mealType,
              title: recipe.title,
              description: recipe.description,
              imageUrl: recipe.imageUrl,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              prepTime: recipe.prepTime,
              tags: recipe.tags
            })
          })
        }
      } else {
        // Use AI generation
        const response = await fetch('/api/ai/meals/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealTypes: selectedTypes,
            days,
            cuisines: ['american', 'italian', 'asian'],
            preferences: {
              options: ['chicken', 'vegetarian'],
              familyFriendly: true,
              quick: true
            }
          })
        })

        if (!response.ok) throw new Error('Failed to generate meals')

        const data = await response.json()
        meals = data.meals
      }

      // Apply leftover logic: Dinner → next-day lunch reuse
      const mealsWithLeftovers = meals.map((meal, index) => {
        if (meal.mealType === 'lunch' && index > 0) {
          const prevDinner = meals.slice(0, index).reverse().find(m => m.mealType === 'dinner')
          if (prevDinner && Math.random() > 0.6) { // 40% chance of leftover
            return {
              ...meal,
              title: `${prevDinner.title} (Leftovers)`,
              description: `Enjoy yesterday's ${prevDinner.title}`,
              imageUrl: prevDinner.imageUrl,
              ingredients: prevDinner.ingredients,
              prepTime: 5,
              isLeftover: true,
              leftoverFrom: prevDinner.id
            }
          }
        }
        return meal
      })

      // Auto-save to weekly meals
      const storedMeals = localStorage.getItem('weeklyMeals') || '[]'
      const weeklyMeals = JSON.parse(storedMeals)
      const updatedWeekly = [...weeklyMeals, ...mealsWithLeftovers]
      localStorage.setItem('weeklyMeals', JSON.stringify(updatedWeekly))
      window.dispatchEvent(new Event('mealsUpdated'))

      // Auto-generate and save shopping list
      const allIngredients = mealsWithLeftovers
        .filter(m => !m.isLeftover) // Skip leftover meals
        .flatMap(m => m.ingredients.map(ing => ing.name.toLowerCase().trim()))
      const uniqueIngredients = Array.from(new Set(allIngredients))

      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: uniqueIngredients })
      })

      setGeneratedMeals(mealsWithLeftovers)
      setStep('results')
    } catch (error) {
      console.error('Error generating meals:', error)
      alert('Failed to generate meal plan. Please try again.')
      setStep('type')
    } finally {
      setIsGenerating(false)
    }
  }

  // Group meals by date and sort by meal type
  const mealsByDate: Record<string, GeneratedMeal[]> = {}
  const mealTypeOrder = { breakfast: 1, lunch: 2, dinner: 3, baking: 4 }
  
  generatedMeals.forEach(meal => {
    if (!mealsByDate[meal.date]) mealsByDate[meal.date] = []
    mealsByDate[meal.date].push(meal)
  })
  
  // Sort meals within each day by meal type
  Object.keys(mealsByDate).forEach(date => {
    mealsByDate[date].sort((a, b) => mealTypeOrder[a.mealType] - mealTypeOrder[b.mealType])
  })
  
  const sortedDates = Object.keys(mealsByDate).sort()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md transition-all duration-250" style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderBottom: '1px solid var(--glass-border)' }}>
        <PageContainer className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'mode') router.back()
              else if (step === 'type') setStep('mode')
              else if (step === 'protein') setStep('type')
              else if (step === 'range') setStep('protein')
              else setStep('type')
            }}
            className="p-2 rounded-lg transition-all duration-250"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: 'var(--text-primary)' }} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--accent-primary)' }}>
              {planningMode === 'curated' ? (
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
              ) : (
                <Wand2 className="w-5 h-5 text-white" strokeWidth={2} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {planningMode === 'curated' ? 'Curated Recipes' : 'Abby AI Meal Planner'}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {step === 'mode' && 'Choose your planning style'}
                {step === 'type' && 'What are we planning?'}
                {step === 'protein' && 'Select protein preference'}
                {step === 'range' && 'How many days?'}
                {step === 'planning' && 'Creating your plan...'}
                {step === 'confirm' && 'Review your plan'}
                {step === 'results' && 'Your meal plan'}
              </p>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Content */}
      <PageContainer className="px-6 py-6">
        {/* Step 0: Mode Selection */}
        {step === 'mode' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How would you like to plan?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Choose your planning style</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Curated Recipes Option */}
              <button
                onClick={() => {
                  setPlanningMode('curated')
                  setStep('type')
                }}
                className="relative p-6 rounded-2xl border-3 text-white shadow-xl hover:shadow-2xl transition-all duration-250 group"
                style={{ backgroundColor: 'var(--accent-primary)', border: '3px solid var(--accent-primary)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">Browse Curated Recipes</h3>
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">RECOMMENDED</span>
                    </div>
                    <p className="mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>Choose from our collection of tested, family-favorite recipes</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        ⚡ Instant
                      </div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        🎯 Curated Quality
                      </div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        💰 No AI Cost
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} strokeWidth={3} />
                  </div>
                </div>
              </button>

              {/* AI Generation Option */}
              <button
                onClick={() => {
                  setPlanningMode('ai')
                  setStep('type')
                }}
                className="relative p-6 rounded-2xl border-3 transition-all duration-250 group"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '3px solid var(--glass-border)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-primary)' }}>
                    <Wand2 className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Generate with Abby</h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Let Abby create custom meal ideas based on your preferences</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)', color: 'var(--accent-primary)' }}>
                        ✨ Creative
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)', color: 'var(--accent-primary)' }}>
                        🎲 Variety
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                        ⏱️ 3-5 sec
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Both options create the same quality meal plans. Choose what feels right!
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Meal Type Selection */}
        {step === 'type' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>What are we planning?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Select the meals you want to plan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(mealTypeConfig) as MealType[]).map(type => {
                const config = mealTypeConfig[type]
                const isSelected = selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleMealType(type)}
                    className={`relative p-6 rounded-2xl border-3 transition-all duration-250 ${
                      isSelected ? 'shadow-lg scale-105' : ''
                    }`}
                    style={{
                      border: isSelected ? '3px solid var(--accent-primary)' : '3px solid var(--glass-border)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      color: isSelected ? 'white' : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{config.emoji}</div>
                    <div className="text-base font-semibold">
                      {config.label}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep('protein')}
              disabled={selectedTypes.length === 0}
              className="w-full py-4 px-6 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Protein Selection */}
        {step === 'protein' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>What protein would you like?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>We'll suggest recipes based on your preference</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROTEIN_OPTIONS.map(option => {
                const isSelected = selectedProtein === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedProtein(option.value)}
                    className="relative p-4 rounded-xl border-2 transition-all duration-250 text-left"
                    style={{
                      border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--glass-border)',
                      backgroundColor: isSelected ? 'rgba(139, 158, 255, 0.1)' : 'var(--bg-elevated)',
                      boxShadow: isSelected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="text-sm font-semibold" style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {option.label}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep('range')}
              className="w-full py-4 px-6 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3: Time Range Selection */}
        {step === 'range' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How many days?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Choose your planning horizon</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'day' as TimeRange, label: 'Just Today', desc: 'Plan for today only' },
                { value: 'week' as TimeRange, label: 'This Week', desc: '7 days of meals' },
                { value: 'custom' as TimeRange, label: 'Custom Range', desc: 'Pick your own days' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className="w-full p-5 rounded-xl border-2 transition-all duration-250 text-left"
                  style={{
                    border: timeRange === option.value ? '2px solid var(--accent-primary)' : '2px solid var(--glass-border)',
                    backgroundColor: timeRange === option.value ? 'rgba(139, 158, 255, 0.1)' : 'var(--bg-elevated)',
                    boxShadow: timeRange === option.value ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (timeRange !== option.value) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeRange !== option.value) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{option.label}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{option.desc}</div>
                    </div>
                    {timeRange === option.value && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {timeRange === 'custom' && (
              <div className="rounded-xl p-5 transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Number of days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-lg font-semibold transition-all duration-250"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
              </div>
            )}

            <button
              onClick={handleCreatePlan}
              className="w-full py-4 px-6 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Sparkles className="w-5 h-5" strokeWidth={2} />
              Create Plan
            </button>
          </div>
        )}

        {/* Step 3: Planning State */}
        {step === 'planning' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }}>
              {planningMode === 'curated' ? (
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
              ) : (
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {planningMode === 'curated' ? 'Selecting your recipes' : 'Creating your meal plan'}
              </h2>
              <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {planningMode === 'curated' 
                  ? 'Choosing the perfect recipes from our curated collection...'
                  : 'Planning delicious meals, applying leftover logic, and generating your shopping list...'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation - Add to Shopping List? */}
        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Plan Preview */}
            <div className="rounded-2xl p-6 border-2 transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '2px solid var(--glass-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--accent-primary)' }}>
                  <ChefHat className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Plan Ready!</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {generatedMeals.length} meals planned
                  </p>
                </div>
              </div>
            </div>

            {/* Shopping List Question */}
            <div className="rounded-2xl border-2 p-6 transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
              <div className="flex items-start gap-3 mb-4">
                <ShoppingCart className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Add ingredients to shopping list?
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    I can add all the ingredients you need for these meals to your shopping list right now.
                  </p>
                  <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p>• {Array.from(new Set(generatedMeals.flatMap(m => m.ingredients.map(i => i.name)))).length} unique ingredients</p>
                    <p>• Organized by category</p>
                    <p>• Ready for your next grocery trip</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    // Save meals and add to shopping list
                    localStorage.setItem('weeklyMeals', JSON.stringify(generatedMeals))
                    
                    const allIngredients = generatedMeals.flatMap(m => 
                      m.ingredients.map(ing => ing.name.toLowerCase().trim())
                    )
                    const uniqueIngredients = Array.from(new Set(allIngredients))
                    
                    await fetch('/api/shopping/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        items: uniqueIngredients,
                        category: 'Meal Plan Ingredients'
                      })
                    })

                    window.dispatchEvent(new Event('mealsUpdated'))
                    setStep('results')
                  }}
                  className="py-3 px-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-250"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Yes, Add All
                </button>
                <button
                  onClick={() => {
                    // Just save meals without adding to shopping list
                    localStorage.setItem('weeklyMeals', JSON.stringify(generatedMeals))
                    window.dispatchEvent(new Event('mealsUpdated'))
                    setStep('results')
                  }}
                  className="py-3 px-4 rounded-xl font-semibold transition-all duration-250"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                >
                  No Thanks
                </button>
              </div>
            </div>

            {/* Quick Preview of Meals */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Meals in this plan:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedMeals.slice(0, 6).map(meal => (
                  <div key={meal.id} className="rounded-xl border p-3 flex gap-3 transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
                    <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={meal.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--accent-primary)' }}>
                        {meal.mealType}
                      </div>
                      <p className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {meal.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {generatedMeals.length > 6 && (
                <p className="text-center text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                  +{generatedMeals.length - 6} more meals
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 'results' && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="rounded-2xl p-6 border-2 transition-all duration-250" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '2px solid rgba(74, 222, 128, 0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--success)' }}>
                  <Check className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Plan Created!</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {generatedMeals.length} meals added • Shopping list updated
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-all duration-250" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}>
                  <Calendar className="w-4 h-4" />
                  Added to calendar
                </div>
                <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-all duration-250" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}>
                  <ShoppingCart className="w-4 h-4" />
                  Groceries ready
                </div>
              </div>
            </div>

            {/* Meal Plan by Day */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Meal Plan</h3>
              <div className="space-y-4">
                {sortedDates.map(date => {
                  const dayMeals = mealsByDate[date]
                  const isExpanded = expandedDay === date
                  return (
                    <div key={date} className="rounded-2xl border-2 overflow-hidden transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : date)}
                        className="w-full p-4 flex items-center justify-between transition-all duration-250"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="text-left">
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {dayMeals.length} meals planned
                          </div>
                        </div>
                        <div className={`transition-transform duration-250 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronLeft className="w-5 h-5 -rotate-90" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t divide-y transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
                          {dayMeals.map(meal => {
                            const isMealExpanded = expandedMeal === meal.id
                            return (
                              <div key={meal.id} className="p-4 relative">
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 z-10"
                                  style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: 'var(--error)' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
                                  title="Remove this meal"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex gap-4 mb-3 pr-10">
                                  <div className="w-24 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image
                                      src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                      alt={meal.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium uppercase" style={{ color: 'var(--accent-primary)' }}>
                                        {meal.mealType}
                                      </span>
                                      {meal.isLeftover && (
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: 'var(--success)' }}>
                                          Leftovers
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{meal.title}</h4>
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{meal.description}</p>
                                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {meal.prepTime} min
                                      </div>
                                      <div>{meal.ingredients.length} ingredients</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Recipe Details Toggle */}
                                <button
                                  onClick={() => setExpandedMeal(isMealExpanded ? null : meal.id)}
                                  className="text-sm font-medium mb-2 transition-colors duration-250"
                                  style={{ color: 'var(--accent-primary)' }}
                                >
                                  {isMealExpanded ? '▼ Hide recipe' : '▶ Show full recipe'}
                                </button>

                                {/* Full Recipe Details */}
                                {isMealExpanded && (
                                  <div className="mt-4 space-y-4 pl-4 border-l-2 transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
                                    {/* Ingredients */}
                                    <div>
                                      <h5 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ingredients:</h5>
                                      <ul className="space-y-1">
                                        {meal.ingredients.map((ing, idx) => (
                                          <li key={idx} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                            • {ing.quantity} {ing.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Instructions */}
                                    {meal.instructions && meal.instructions.length > 0 && (
                                      <div>
                                        <h5 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Instructions:</h5>
                                        <ol className="space-y-2">
                                          {meal.instructions.map((instruction, idx) => (
                                            <li key={idx} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                              <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{idx + 1}.</span> {instruction}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-6">
              <button
                onClick={() => router.push('/kitchen')}
                className="w-full py-4 px-6 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-250"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Done
              </button>
              <button
                onClick={() => {
                  setStep('type')
                  setGeneratedMeals([])
                }}
                className="w-full py-3 font-medium transition-colors duration-250"
                style={{ color: 'var(--text-primary)' }}
              >
                Create Another Plan
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
