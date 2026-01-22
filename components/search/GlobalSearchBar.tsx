'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, CheckCircle2, FileText, Calendar, User, Heart, UtensilsCrossed, ShoppingCart, Clock, ChefHat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Task, Meal, ShoppingItem, FamilyMember, Pet } from '@/types/home'
import { RECIPE_DATABASE, Recipe } from '@/data/recipeDatabase'

interface SearchResult {
  id: string
  type: 'task' | 'note' | 'appointment' | 'family' | 'pet' | 'meal' | 'shopping' | 'reminder' | 'document' | 'recipe'
  title: string
  subtitle?: string
  route: string
  icon: React.ReactNode
  data?: any
}

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
}

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  createdAt: string
}

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length > 0) {
      performSearch(query.trim())
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase()
    const allResults: SearchResult[] = []

    // Search To-Dos
    try {
      const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
      tasks.forEach((task) => {
        if (
          task.title.toLowerCase().includes(lowerQuery) ||
          task.category.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: task.category,
            route: '/dashboard/tasks',
            icon: <CheckCircle2 className="w-4 h-4 text-blue-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching to-dos:', e)
    }

    // Search Notes
    try {
      const notes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]')
      notes.forEach((note) => {
        if (
          note.title.toLowerCase().includes(lowerQuery) ||
          note.body.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: note.id,
            type: 'note',
            title: note.title || 'Untitled Note',
            subtitle: note.body.substring(0, 50),
            route: '/home',
            icon: <FileText className="w-4 h-4 text-purple-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching notes:', e)
    }

    // Search Appointments
    try {
      const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]')
      appointments.forEach((appt) => {
        if (
          appt.title.toLowerCase().includes(lowerQuery) ||
          appt.location?.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: appt.id,
            type: 'appointment',
            title: appt.title,
            subtitle: appt.date ? new Date(appt.date).toLocaleDateString() : undefined,
            route: '/home/calendar',
            icon: <Calendar className="w-4 h-4 text-green-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching appointments:', e)
    }

    // Search Family Members
    try {
      const family: FamilyMember[] = JSON.parse(localStorage.getItem('family') || '[]')
      family.forEach((member) => {
        if (
          member.name.toLowerCase().includes(lowerQuery) ||
          member.relationship?.toLowerCase().includes(lowerQuery) ||
          member.notes?.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: member.id,
            type: 'family',
            title: member.name,
            subtitle: member.relationship,
            route: '/people/family',
            icon: <User className="w-4 h-4 text-blue-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching family:', e)
    }

    // Search Pets
    try {
      const pets: Pet[] = JSON.parse(localStorage.getItem('pets') || '[]')
      pets.forEach((pet) => {
        if (
          pet.name.toLowerCase().includes(lowerQuery) ||
          pet.type.toLowerCase().includes(lowerQuery) ||
          pet.breed?.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: pet.id,
            type: 'pet',
            title: pet.name,
            subtitle: `${pet.type}${pet.breed ? ` • ${pet.breed}` : ''}`,
            route: '/people/pets',
            icon: <Heart className="w-4 h-4 text-pink-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching pets:', e)
    }

    // Search Meals
    try {
      const meals: Meal[] = JSON.parse(localStorage.getItem('meals') || '[]')
      meals.forEach((meal) => {
        if (meal.name.toLowerCase().includes(lowerQuery)) {
          allResults.push({
            id: meal.id,
            type: 'meal',
            title: meal.name,
            subtitle: `${meal.mealType} • ${meal.day}`,
            route: '/dashboard/meals',
            icon: <UtensilsCrossed className="w-4 h-4 text-orange-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching meals:', e)
    }

    // Search Shopping Items
    try {
      const shopping: ShoppingItem[] = JSON.parse(localStorage.getItem('shoppingItems') || '[]')
      shopping.forEach((item) => {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          allResults.push({
            id: item.id,
            type: 'shopping',
            title: item.name,
            subtitle: item.category,
            route: '/dashboard/shopping',
            icon: <ShoppingCart className="w-4 h-4 text-yellow-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching shopping:', e)
    }

    // Search Reminders (stored as tasks with ID prefix "reminder-")
    try {
      const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
      tasks
        .filter((task) => task.id.startsWith('reminder-'))
        .forEach((task) => {
          if (task.title.toLowerCase().includes(lowerQuery)) {
            allResults.push({
              id: task.id,
              type: 'reminder',
              title: task.title,
              subtitle: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
              route: '/dashboard/tasks',
              icon: <Clock className="w-4 h-4 text-red-600" strokeWidth={2} />,
            })
          }
        })
    } catch (e) {
      console.error('Error searching reminders:', e)
    }

    // Search Documents
    try {
      const documents: any[] = JSON.parse(localStorage.getItem('documents') || '[]')
      documents.forEach((doc) => {
        if (
          doc.title.toLowerCase().includes(lowerQuery) ||
          doc.description?.toLowerCase().includes(lowerQuery) ||
          doc.fileName.toLowerCase().includes(lowerQuery)
        ) {
          allResults.push({
            id: doc.id,
            type: 'document',
            title: doc.title,
            subtitle: doc.fileName,
            route: '/office/documents',
            icon: <FileText className="w-4 h-4 text-gray-600" strokeWidth={2} />,
          })
        }
      })
    } catch (e) {
      console.error('Error searching documents:', e)
    }

    // Search Recipes (from Recipe Database)
    try {
      RECIPE_DATABASE.forEach((recipe) => {
        if (
          recipe.title.toLowerCase().includes(lowerQuery) ||
          recipe.description.toLowerCase().includes(lowerQuery) ||
          recipe.cuisine.toLowerCase().includes(lowerQuery) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        ) {
          allResults.push({
            id: recipe.id,
            type: 'recipe',
            title: recipe.title,
            subtitle: `${recipe.cuisine} • ${recipe.mealType}`,
            route: '/kitchen/recipes',
            icon: <ChefHat className="w-4 h-4 text-purple-600" strokeWidth={2} />,
            data: recipe,
          })
        }
      })
    } catch (e) {
      console.error('Error searching recipes:', e)
    }

    // Sort by relevance (exact matches first, then partial)
    allResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === lowerQuery
      const bExact = b.title.toLowerCase() === lowerQuery
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return a.title.localeCompare(b.title)
    })

    setResults(allResults.slice(0, 10)) // Limit to 10 results
    setIsOpen(allResults.length > 0)
  }

  const handleResultClick = (result: SearchResult) => {
    // Special handling for recipes - open detail modal instead of navigating
    if (result.type === 'recipe' && result.data) {
      setSelectedRecipe(result.data)
      setQuery('')
      setResults([])
      setIsOpen(false)
      setIsFocused(false)
    } else {
      router.push(result.route)
      setQuery('')
      setResults([])
      setIsOpen(false)
      setIsFocused(false)
    }
  }

  const handleAddToShoppingList = async (recipe: Recipe) => {
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
      
      alert(`Added ${ingredientNames.length} ingredients from "${recipe.title}" to shopping list`)
    } catch (error) {
      console.error('Error adding ingredients:', error)
      alert('Failed to add ingredients')
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setIsFocused(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto mb-4">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder="Search recipes, to-dos, notes, people..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition-colors"
          style={{
            borderColor: 'var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left"
                style={{
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)'
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <div className="flex-shrink-0 mt-0.5">{result.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{result.title}</p>
                  {result.subtitle && (
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{result.subtitle}</p>
                  )}
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>{result.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg p-4 z-50 transition-colors"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>No results found</p>
        </div>
      )}

      {/* Recipe Detail Modal (from global search) */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Image */}
            <div className="relative">
              <img
                src={selectedRecipe.imageUrl}
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-xs font-medium text-purple-600 uppercase mb-2">
                {selectedRecipe.mealType} • {selectedRecipe.cuisine} • {selectedRecipe.difficulty}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {selectedRecipe.title}
              </h2>
              <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>

              {/* Recipe Metadata */}
              <div className="flex gap-6 mb-6 pb-6 border-b">
                <div className="text-center">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-gray-900">{selectedRecipe.totalTime} min</div>
                  <div className="text-xs text-gray-500">Total Time</div>
                </div>
                <div className="text-center">
                  <User className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-gray-900">{selectedRecipe.servings}</div>
                  <div className="text-xs text-gray-500">Servings</div>
                </div>
                {selectedRecipe.calories && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{selectedRecipe.calories}</div>
                    <div className="text-xs text-gray-500">Calories</div>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>
                        <span className="font-medium">{ing.quantity}</span> {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tags */}
              {selectedRecipe.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex gap-2 flex-wrap">
                    {selectedRecipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleAddToShoppingList(selectedRecipe)
                    setSelectedRecipe(null)
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Add Ingredients to Shopping List
                </button>
                <button
                  onClick={() => router.push('/kitchen/recipes')}
                  className="w-full py-3 px-4 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Browse More Recipes
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full py-3 px-4 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
