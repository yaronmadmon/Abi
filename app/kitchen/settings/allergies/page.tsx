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
          <Link href="/kitchen" className="inline-flex items-center gap-2 mb-4 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-5 h-5" />
            Back to Kitchen
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8" style={{ color: 'var(--error)' }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Allergies & Dietary Restrictions</h1>
          </div>
          
          <p className="text-sm transition-all duration-250" style={{ color: 'var(--text-secondary)' }}>
            Select all household allergies and dietary restrictions. The Kitchen system will automatically filter unsafe recipes.
          </p>
        </div>

        {/* Safety Notice */}
        <div className="rounded-lg p-6 mb-6 transition-all duration-250" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '2px solid rgba(248, 113, 113, 0.3)' }}>
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
            <div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Important Safety Information</h3>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• These preferences apply to Recipe Library, Meal Planner, and Abby AI suggestions</li>
                <li>• Unsafe recipes will be automatically filtered from all searches</li>
                <li>• Abby AI will never suggest meals containing your selected allergens</li>
                <li>• Always verify ingredients independently for severe allergies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Allergen Selection */}
        <div className="rounded-lg shadow-sm border-2 p-6 mb-6 transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Select Household Allergens</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMON_ALLERGENS.map((allergen) => {
              const isSelected = preferences.allergens.includes(allergen.id)
              
              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergen(allergen.id)}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-250 text-left"
                  style={{
                    backgroundColor: isSelected ? 'rgba(248, 113, 113, 0.1)' : 'var(--bg-elevated)',
                    border: isSelected ? '2px solid var(--error)' : '2px solid var(--glass-border)',
                    boxShadow: isSelected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--error)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                    }
                  }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
                    {allergen.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allergen.label}</div>
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--error)' }}>
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="rounded-lg shadow-sm border-2 p-6 mb-6 transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Display Options</h2>
          
          <button
            onClick={handleShowExcludedToggle}
            className="flex items-center gap-3 w-full p-4 rounded-lg border-2 transition-all duration-250 text-left"
            style={{ border: '2px solid var(--glass-border)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-250" style={{ backgroundColor: preferences.showExcluded ? 'rgba(139, 158, 255, 0.2)' : 'rgba(255,255,255,0.05)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: preferences.showExcluded ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            </div>
            
            <div className="flex-1">
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Show Excluded Recipes</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Display unsafe recipes with warning labels</div>
            </div>
            
            <div className="flex-shrink-0 w-12 h-6 rounded-full transition-all duration-250" style={{ backgroundColor: preferences.showExcluded ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)' }}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-250 m-0.5 ${
                preferences.showExcluded ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        {/* Summary */}
        {preferences.allergens.length > 0 && (
          <div className="rounded-lg p-6 mb-6 transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '2px solid var(--glass-border)' }}>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Active Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.allergens.map(allergenId => {
                const allergen = COMMON_ALLERGENS.find(a => a.id === allergenId)
                return allergen ? (
                  <span key={allergenId} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)', color: 'var(--text-primary)' }}>
                    <span>{allergen.icon}</span>
                    <span>{allergen.label}</span>
                  </span>
                ) : null
              })}
            </div>
            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
              {preferences.allergens.length} allergen{preferences.allergens.length !== 1 ? 's' : ''} selected • 
              Recipes containing these ingredients will be filtered
            </p>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full py-4 px-6 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-250"
            style={{ backgroundColor: 'var(--error)' }}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              Save Allergy Preferences
            </div>
          </button>
        )}

        {!hasChanges && preferences.allergens.length > 0 && (
          <div className="text-center p-4 text-sm transition-all duration-250" style={{ color: 'var(--text-secondary)' }}>
            ✓ Preferences saved • Recipes are being filtered for safety
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-4 rounded-lg border transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            💡 <strong>Tip:</strong> These settings apply system-wide. Update them anytime from the Kitchen hub.
          </p>
        </div>
      </PageContainer>
    </div>
  )
}
