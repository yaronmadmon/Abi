'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, AlertTriangle, Check, Shield } from 'lucide-react'
import { 
  COMMON_ALLERGENS, 
  getAllergyPreferences, 
  saveAllergyPreferences,
  type AllergyPreferences 
} from '@/lib/allergyManager'
import PageContainer from '@/components/ui/PageContainer'

export default function AllergiesPage() {
  const [preferences, setPreferences] = useState<AllergyPreferences>({
    allergens: [],
    showExcluded: false,
    lastUpdated: ''
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const prefs = getAllergyPreferences()
    setPreferences(prefs)
  }, [])

  const toggleAllergen = (allergenId: string) => {
    const updated = preferences.allergens.includes(allergenId)
      ? preferences.allergens.filter(a => a !== allergenId)
      : [...preferences.allergens, allergenId]
    
    setPreferences(prev => ({
      ...prev,
      allergens: updated
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    saveAllergyPreferences(preferences)
    setHasChanges(false)
    alert('Allergy preferences saved successfully!')
  }

  const handleShowExcludedToggle = () => {
    const updated = {
      ...preferences,
      showExcluded: !preferences.showExcluded
    }
    setPreferences(updated)
    saveAllergyPreferences(updated)
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        {/* Header */}
        <div className="mb-6">
          <Link href="/kitchen" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <ChevronLeft className="w-5 h-5" />
            Back to Kitchen
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-red-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900">Allergies & Dietary Restrictions</h1>
          </div>
          
          <p className="text-gray-600 text-sm">
            Select all household allergies and dietary restrictions. The Kitchen system will automatically filter unsafe recipes.
          </p>
        </div>

        {/* Safety Notice */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Important Safety Information</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• These preferences apply to Recipe Library, Meal Planner, and Abby AI suggestions</li>
                <li>• Unsafe recipes will be automatically filtered from all searches</li>
                <li>• Abby AI will never suggest meals containing your selected allergens</li>
                <li>• Always verify ingredients independently for severe allergies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Allergen Selection */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Household Allergens</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMON_ALLERGENS.map((allergen) => {
              const isSelected = preferences.allergens.includes(allergen.id)
              
              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergen(allergen.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'bg-red-50 border-red-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-2xl">
                    {allergen.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{allergen.label}</div>
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Display Options</h2>
          
          <button
            onClick={handleShowExcludedToggle}
            className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-all text-left"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
              preferences.showExcluded ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${preferences.showExcluded ? 'text-orange-600' : 'text-gray-400'}`} />
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Show Excluded Recipes</div>
              <div className="text-sm text-gray-600">Display unsafe recipes with warning labels</div>
            </div>
            
            <div className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
              preferences.showExcluded ? 'bg-orange-500' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform m-0.5 ${
                preferences.showExcluded ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        {/* Summary */}
        {preferences.allergens.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">Active Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.allergens.map(allergenId => {
                const allergen = COMMON_ALLERGENS.find(a => a.id === allergenId)
                return allergen ? (
                  <span key={allergenId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-blue-300 rounded-full text-sm font-medium text-blue-900">
                    <span>{allergen.icon}</span>
                    <span>{allergen.label}</span>
                  </span>
                ) : null
              })}
            </div>
            <p className="text-sm text-blue-800 mt-3">
              {preferences.allergens.length} allergen{preferences.allergens.length !== 1 ? 's' : ''} selected • 
              Recipes containing these ingredients will be filtered
            </p>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              Save Allergy Preferences
            </div>
          </button>
        )}

        {!hasChanges && preferences.allergens.length > 0 && (
          <div className="text-center p-4 text-sm text-gray-500">
            ✓ Preferences saved • Recipes are being filtered for safety
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Tip:</strong> These settings apply system-wide. Update them anytime from the Kitchen hub.
          </p>
        </div>
      </PageContainer>
    </div>
  )
}
