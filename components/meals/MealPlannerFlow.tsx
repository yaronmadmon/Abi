'use client'

import { useState } from 'react'
import { X, ChevronLeft, Sparkles, Check } from 'lucide-react'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'baker'
type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface MealPlannerFlowProps {
  onComplete: (meals: any[]) => void
  onCancel: () => void
}

export default function MealPlannerFlow({ onComplete, onCancel }: MealPlannerFlowProps) {
  const [step, setStep] = useState(1)
  const [mealTypes, setMealTypes] = useState<MealType[]>(['dinner'])
  const [days, setDays] = useState<Day[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [cuisines, setCuisines] = useState<string[]>([])
  const [preferences, setPreferences] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMeals, setGeneratedMeals] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const cuisineOptions = ['American', 'Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian']
  
  const proteinOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Pork', 'Mixed']
  const bakingOptions = ['Bread', 'Desserts', 'Baking with kids', 'Weekend baking']
  
  const preferenceOptions = mealTypes.includes('baker') ? bakingOptions : proteinOptions

  const dayLabels: Record<Day, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun'
  }

  const mealTypeLabels: Record<MealType, { label: string; emoji: string }> = {
    breakfast: { label: 'Breakfast', emoji: '🍳' },
    lunch: { label: 'Lunch', emoji: '🥪' },
    dinner: { label: 'Dinner', emoji: '🍽' },
    baker: { label: 'Baker Corner', emoji: '🧁' }
  }

  const toggleMealType = (type: MealType) => {
    setMealTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleDay = (day: Day) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleItem = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const canGenerate = mealTypes.length > 0 && days.length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealTypes,
          days,
          cuisines,
          preferences: {
            options: preferences,
            familyFriendly: true,
            quick: true
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate meals')

      const data = await response.json()
      setGeneratedMeals(data.meals)
      setShowPreview(true)
      setStep(5) // Move to preview step
    } catch (error) {
      console.error('Error generating meals:', error)
      alert('Failed to generate meals. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirmMeals = () => {
    onComplete(generatedMeals)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {step === 1 && 'What are we planning?'}
              {step === 2 && 'Which days?'}
            {step === 3 && 'Any preferences?'}
            {step === 4 && 'Ready to generate'}
            {step === 5 && 'Your meal plan'}
          </h3>
          <p className="text-sm text-gray-500">Step {step} of {showPreview ? '5' : '4'}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
        </button>
      </div>

      {/* Step 1: Meal Type Selector */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(mealTypeLabels) as MealType[]).map(type => (
              <button
                key={type}
                onClick={() => toggleMealType(type)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  mealTypes.includes(type)
                    ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {mealTypes.includes(type) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-orange-500" strokeWidth={3} />
                  </div>
                )}
                <div className="text-3xl mb-2">{mealTypeLabels[type].emoji}</div>
                <div className={`text-sm font-medium ${mealTypes.includes(type) ? 'text-white' : 'text-gray-900'}`}>
                  {mealTypeLabels[type].label}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={mealTypes.length === 0}
            className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Day Picker */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between gap-2">
            {(Object.keys(dayLabels) as Day[]).map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  days.includes(day)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {dayLabels[day]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            disabled={days.length === 0}
            className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Cuisines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cuisines
            </label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => toggleItem(cuisine, cuisines, setCuisines)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cuisines.includes(cuisine)
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisines.includes(cuisine) && '✓ '}{cuisine}
              </button>
              ))}
            </div>
          </div>

          {/* Proteins or Baking Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {mealTypes.includes('baker') ? 'Baking preferences' : 'Proteins'}
            </label>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map(option => (
                <button
                  key={option}
                  onClick={() => toggleItem(option, preferences, setPreferences)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    preferences.includes(option)
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preferences.includes(option) && '✓ '}{option}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 4: Generate */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Meal Types</div>
              <div className="text-sm text-gray-900">
                {mealTypes.map(t => mealTypeLabels[t].label).join(', ')}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Days</div>
              <div className="text-sm text-gray-900">
                {days.map(d => dayLabels[d]).join(', ')}
              </div>
            </div>
            {cuisines.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Cuisines</div>
                <div className="text-sm text-gray-900">{cuisines.join(', ')}</div>
              </div>
            )}
            {preferences.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Preferences</div>
                <div className="text-sm text-gray-900">{preferences.join(', ')}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full py-4 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating meals...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={2} />
                Generate meals
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 5: Preview Generated Meals */}
      {step === 5 && showPreview && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Here's your personalized meal plan! Review and add to your week.
          </p>
          
          {/* Generated Meals Preview */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {generatedMeals.map((meal) => (
              <div key={meal.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-all">
                <div className="flex gap-3">
                  {meal.imageUrl && (
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-orange-600 uppercase">
                        {meal.mealType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{meal.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{meal.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {meal.prepTime} min • {meal.ingredients.length} ingredients
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmMeals}
            className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" strokeWidth={2} />
            Add meals to this week
          </button>
        </div>
      )}
    </div>
  )
}
