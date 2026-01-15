'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, CheckCircle2, FileText, Calendar, User, Heart, UtensilsCrossed, ShoppingCart, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Task, Meal, ShoppingItem, FamilyMember, Pet } from '@/types/home'

interface SearchResult {
  id: string
  type: 'task' | 'note' | 'appointment' | 'family' | 'pet' | 'meal' | 'shopping' | 'reminder' | 'document'
  title: string
  subtitle?: string
  route: string
  icon: React.ReactNode
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

    // Search Reminders (stored as tasks with category "reminder")
    try {
      const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
      tasks
        .filter((task) => task.category === 'reminder')
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
    router.push(result.route)
    setQuery('')
    setResults([])
    setIsOpen(false)
    setIsFocused(false)
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
          placeholder="Search to-dos, notes, people, pets..."
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
    </div>
  )
}
