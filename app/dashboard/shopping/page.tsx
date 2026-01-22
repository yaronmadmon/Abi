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
          <Link href="/today" className="text-gray-500 hover:text-gray-700 text-sm mb-3 inline-block">
            ← Back to Today
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} • {items.filter(i => i.completed).length} checked
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearAllItems}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
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
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-6"
          >
            + Add Item Manually
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-5 mb-6 border-2 border-gray-100">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
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
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItemName('')
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border-2 border-gray-100">
            <p className="text-lg mb-2">No items yet</p>
            <p className="text-sm">Add something to your list!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="bg-white rounded-2xl p-5 border-2 border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                  {category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  <span className="ml-2 text-gray-400 font-normal">({categoryItems.length})</span>
                </h2>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors bg-white border border-gray-100"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItem(item.id)
                        }}
                        className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer"
                        aria-label={item.completed ? 'Uncheck item' : 'Check item'}
                      >
                        {item.completed && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div
                        onClick={() => toggleItem(item.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <p
                          className={`text-base ${
                            item.completed
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}
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
                        className="flex-shrink-0 w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer"
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
