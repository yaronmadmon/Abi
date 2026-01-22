'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Lightbulb, ChevronRight, Loader2 } from 'lucide-react'
import { getSubstitutionSuggestions, type SubstitutionResult, type SubstitutionOption } from '@/lib/substitutionEngine'
import { formatAllergenNames } from '@/lib/allergyManager'

interface SubstitutionModalProps {
  missingIngredient: string
  recipeTitle: string
  onClose: () => void
  onAddToShopping: () => void
  onApplySubstitution?: (substitution: SubstitutionOption) => void
}

export default function SubstitutionModal({
  missingIngredient,
  recipeTitle,
  onClose,
  onAddToShopping,
  onApplySubstitution
}: SubstitutionModalProps) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<SubstitutionResult | null>(null)
  const [selectedOption, setSelectedOption] = useState<SubstitutionOption | null>(null)

  useEffect(() => {
    loadSubstitutions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingIngredient])

  const loadSubstitutions = async () => {
    setLoading(true)
    try {
      const subs = await getSubstitutionSuggestions(
        missingIngredient,
        recipeTitle,
        [] // TODO: Pass actual pantry items
      )
      setResult(subs)
    } catch (error) {
      console.error('Error loading substitutions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Missing Ingredient</h2>
            <p className="text-sm text-gray-600 mt-1">Find a substitution or add to shopping</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Missing Item Card */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Missing: {missingIngredient}</h3>
                <p className="text-sm text-orange-800">Required for: {recipeTitle}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">What would you like to do?</h3>
            
            {/* Option 1: Add to Shopping */}
            <button
              onClick={() => {
                onAddToShopping()
                onClose()
              }}
              className="w-full p-4 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600">Add to Shopping List</div>
                  <div className="text-sm text-gray-600">Get it on your next trip to the store</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>

            {/* Option 2: Use Substitution */}
            <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 p-4 border-b-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">Use What I Have</div>
                    <div className="text-sm text-purple-800">Smart substitution suggestions</div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Finding safe substitutions...</p>
                </div>
              ) : result && result.alternatives.length > 0 ? (
                <div className="p-4 space-y-3">
                  {result.alternatives.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(selectedOption?.name === option.name ? null : option)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedOption?.name === option.name
                          ? 'bg-purple-50 border-purple-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{option.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{option.description}</div>
                      
                      {selectedOption?.name === option.name && (
                        <div className="mt-3 pt-3 border-t border-purple-200 space-y-3">
                          {/* Ingredients */}
                          <div>
                            <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Ingredients:</div>
                            <div className="flex flex-wrap gap-2">
                              {option.ingredients.map((ing, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-white border border-purple-200 rounded-full text-gray-700">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Steps */}
                          <div>
                            <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Steps:</div>
                            <ol className="space-y-1.5">
                              {option.steps.map((step, i) => (
                                <li key={i} className="text-sm text-gray-700 flex gap-2">
                                  <span className="flex-shrink-0 font-semibold text-purple-600">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Flavor Note */}
                          {option.flavorNote && (
                            <div className="text-xs text-gray-600 italic">
                              💡 Note: {option.flavorNote}
                            </div>
                          )}

                          {/* Allergen Warning */}
                          {option.allergens && option.allergens.length > 0 && (
                            <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Contains: {formatAllergenNames(option.allergens)}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                  
                  {/* Apply Substitution Button */}
                  {selectedOption && onApplySubstitution && (
                    <button
                      onClick={() => {
                        onApplySubstitution(selectedOption)
                        onClose()
                      }}
                      className="w-full p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Use "{selectedOption.name}" in Recipe
                    </button>
                  )}
                  
                  {result.safetyNote && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-900">
                        ℹ️ {result.safetyNote}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    No safe substitutions found for this ingredient.
                  </p>
                  <p className="text-xs text-gray-500">
                    Consider adding it to your shopping list instead.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Tip:</strong> Substitutions respect your allergy settings. Always verify ingredients independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
