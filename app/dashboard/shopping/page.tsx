'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ShoppingItem } from '@/types/home'
import AIInputBar from '@/components/AIInputBar'
import { showToast } from '@/components/feedback/ToastContainer'

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
    localStorage.setItem('shoppingItems', JSON.stringify(newItems))
    setItems(newItems)
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
      showToast('Item added', 'success')
    } catch (error) {
      showToast('Couldn\'t add item', 'error')
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
      showToast('Item deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete item', 'error')
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'shopping') {
      const category = (payload.category || 'other') as ShoppingItem['category']
      // Handle multiple items from payload.items array
      const items = payload.items || []
      items.forEach((name: string) => {
        addItem(name, category)
      })
      // Reload items to show the new ones
      loadItems()
      showToast(`${items.length === 1 ? 'Item' : 'Items'} added`, 'success')
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
    <div className="min-h-screen p-6 pb-40">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
          <div className="w-12"></div>
        </div>

        <AIInputBar onIntent={handleAIIntent} />

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-secondary w-full mb-6"
          >
            + Add Item Manually
          </button>
        ) : (
          <div className="glass-card p-4 mb-6">
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
                className="btn-primary flex-1"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItemName('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">
            No items yet. Add something to your list!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="glass-card p-4">
                <h2 className="font-semibold text-gray-700 mb-3">
                  {category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h2>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p
                          className={`${
                            item.completed
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
