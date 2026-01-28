'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
            icon: <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />,
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
            icon: <FileText className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />,
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
            icon: <Calendar className="w-4 h-4" style={{ color: 'var(--success)' }} strokeWidth={2} />,
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
            icon: <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />,
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
            icon: <Heart className="w-4 h-4" style={{ color: 'var(--error)' }} strokeWidth={2} />,
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
            icon: <UtensilsCrossed className="w-4 h-4" style={{ color: 'var(--warning)' }} strokeWidth={2} />,
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
            icon: <ShoppingCart className="w-4 h-4" style={{ color: 'var(--warning)' }} strokeWidth={2} />,
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
            icon: <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />,
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
            icon: <ChefHat className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />,
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
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
          className="w-full pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 backdrop-blur-sm transition-colors duration-250"
          style={{
            border: '1px solid var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-250 hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            type="button"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl max-h-[400px] overflow-y-auto z-50"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <div className="p-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-start gap-3 p-3 rounded-lg transition-colors duration-250 text-left hover:bg-white/5"
                style={{
                  color: 'var(--text-primary)',
                }}
              >
                <div className="flex-shrink-0 mt-0.5">{result.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{result.title}</p>
                  {result.subtitle && (
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{result.subtitle}</p>
                  )}
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{result.type}</p>
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
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            {/* Modal Header with Image */}
            <div className="relative w-full h-64">
              <Image
                src={selectedRecipe.imageUrl}
                alt={selectedRecipe.title}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-250"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                  backdropFilter: 'blur(8px)',
                  color: 'white'
                }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--accent-primary)' }}>
                {selectedRecipe.mealType} • {selectedRecipe.cuisine} • {selectedRecipe.difficulty}
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {selectedRecipe.title}
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{selectedRecipe.description}</p>

              {/* Recipe Metadata */}
              <div className="flex gap-6 mb-6 pb-6" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRecipe.totalTime} min</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Time</div>
                </div>
                <div className="text-center">
                  <User className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRecipe.servings}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Servings</div>
                </div>
                {selectedRecipe.calories && (
                  <div className="text-center">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRecipe.calories}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</div>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>•</span>
                      <span>
                        <span className="font-medium">{ing.quantity}</span> {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Instructions</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span 
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)', color: 'var(--accent-primary)' }}
                      >
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
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
                <button
                  onClick={() => {
                    handleAddToShoppingList(selectedRecipe)
                    setSelectedRecipe(null)
                  }}
                  className="w-full py-3 px-4 text-white rounded-full font-semibold transition-all duration-250 hover:shadow-lg active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)' }}
                >
                  Add Ingredients to Shopping List
                </button>
                <button
                  onClick={() => router.push('/kitchen/recipes')}
                  className="w-full py-3 px-4 font-medium transition-colors duration-250 hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Browse More Recipes
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full py-3 px-4 font-medium transition-colors duration-250 hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
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
