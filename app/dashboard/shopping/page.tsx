'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import type { ShoppingItem } from '@/types/home'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ShoppingItem['category']>('other')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const stored = localStorage.getItem('shoppingItems')
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }

  const saveItems = (newItems: ShoppingItem[]) => {
    try {
      localStorage.setItem('shoppingItems', JSON.stringify(newItems))
      setItems(newItems)
      window.dispatchEvent(new Event('shoppingUpdated'))
    } catch (error) {
      console.error('Failed to save shopping items to localStorage:', error)
      // Check if it's a quota exceeded error
      if (error instanceof Error && (error.name === 'QuotaExceededError' || (error as any).code === 22)) {
        showToast('Storage is full. Please clear browser data or remove some items.', 'error')
      } else {
        showToast('Failed to save shopping list. Please try again.', 'error')
      }
      throw error // Re-throw so caller knows save failed
    }
  }

  const addItem = (name: string, category: ShoppingItem['category'] = 'other') => {
    try {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name,
        category,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      saveItems([...items, item])
      setNewItemName('')
      setShowAddForm(false)
      showToast('Added to your list! ✓', 'success')
    } catch (error) {
      showToast('Oops! Couldn\'t add that. Try again?', 'error')
    }
  }

  const toggleItem = (id: string) => {
    try {
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
      saveItems(updatedItems)
      const item = items.find((i) => i.id === id)
      if (item) {
        showToast(item.completed ? 'Item unchecked' : 'Item checked', 'success')
      }
    } catch (error) {
      showToast('Couldn\'t update item', 'error')
    }
  }

  const deleteItem = (id: string) => {
    try {
      saveItems(items.filter((item) => item.id !== id))
      showToast('Item removed from your list ✓', 'success')
    } catch (error) {
      showToast('Couldn\'t delete item', 'error')
    }
  }

  const clearAllItems = () => {
    if (!confirm('Are you sure you want to delete all shopping items? This cannot be undone.')) return
    
    try {
      localStorage.setItem('shoppingItems', JSON.stringify([]))
      setItems([])
      showToast('Shopping list cleared! Ready for a fresh start? 🛒', 'success')
    } catch (error) {
      showToast('Failed to clear items', 'error')
    }
  }

  const categories: ShoppingItem['category'][] = [
    'produce',
    'dairy',
    'meat',
    'cleaning',
    'pantry',
    'other',
  ]

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  return (
    <div className="min-h-screen p-6 pb-40 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        <div className="mb-6">
          <Link href="/today" className="text-sm mb-3 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            ← Back to Today
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Shopping List</h1>
              <p className="text-sm mt-1 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'} • {items.filter(i => i.completed).length} checked
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearAllItems}
                className="text-sm font-medium flex items-center gap-1 transition-colors duration-250"
                style={{ color: 'var(--error)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 px-6 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-250 mb-6"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            + Add Item Manually
          </button>
        ) : (
          <div className="rounded-2xl p-5 mb-6 transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none transition-all duration-250"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 158, 255, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newItemName.trim()) {
                  addItem(newItemName.trim(), selectedCategory)
                }
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as ShoppingItem['category'])
              }
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none transition-all duration-250"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 158, 255, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newItemName.trim()) {
                    addItem(newItemName.trim(), selectedCategory)
                  }
                }}
                className="flex-1 py-3 px-4 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-250"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItemName('')
                }}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-250"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <div className="rounded-2xl p-8 text-center transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
            <p className="text-lg mb-2 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>No items yet</p>
            <p className="text-sm">Add something to your list!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="rounded-2xl p-5 transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                <h2 className="font-bold mb-4 text-sm uppercase tracking-wide transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                  {category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  <span className="ml-2 font-normal transition-colors duration-250" style={{ color: 'var(--text-muted)' }}>({categoryItems.length})</span>
                </h2>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-250"
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItem(item.id)
                        }}
                        className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors duration-250 cursor-pointer"
                        style={{ borderColor: 'var(--glass-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        aria-label={item.completed ? 'Uncheck item' : 'Check item'}
                      >
                        {item.completed && (
                          <svg className="w-4 h-4 transition-colors duration-250" style={{ color: 'var(--accent-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div
                        onClick={() => toggleItem(item.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <p
                          className={`text-base transition-colors duration-250 ${
                            item.completed ? 'line-through' : ''
                          }`}
                          style={{ color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                        >
                          {item.name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete "${item.name}"?`)) {
                            deleteItem(item.id)
                          }
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-lg transition-colors duration-250 flex items-center justify-center cursor-pointer"
                        style={{ color: 'var(--error)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'
                          e.currentTarget.style.opacity = '0.8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.opacity = '1'
                        }}
                        aria-label="Delete item"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  )
}
