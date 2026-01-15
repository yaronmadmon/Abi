'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'
import type { Pet } from '@/types/home'
import AIInputBar from '@/components/AIInputBar'
import AIPen from '@/components/AIPen'
import PetCard from '@/components/people/PetCard'
import { showToast } from '@/components/feedback/ToastContainer'

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('dog')
  const [newBreed, setNewBreed] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadPets()
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pets') {
        loadPets()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadPets = () => {
    try {
      const stored = localStorage.getItem('pets')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPets(parsed)
        console.log('✅ Loaded pets:', parsed.length)
      } else {
        setPets([])
      }
    } catch (error) {
      console.error('❌ Error loading pets:', error)
      setPets([])
    }
  }

  const savePets = (newPets: Pet[]) => {
    localStorage.setItem('pets', JSON.stringify(newPets))
    setPets(newPets)
    // Trigger storage event
    window.dispatchEvent(new Event('storage'))
  }

  const addPet = () => {
    if (!newName.trim()) {
      return
    }

    const pet: Pet = {
      id: `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName.trim(),
      type: newType,
      breed: newBreed.trim() || undefined,
      age: newAge ? parseInt(newAge) : undefined,
      birthday: newBirthday.trim() || undefined,
      notes: newNotes.trim() || undefined,
      vetName: newVetName.trim() || undefined,
      vetPhone: newVetPhone.trim() || undefined,
      photo: newPhoto || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    savePets([...pets, pet])
    setNewName('')
    setNewType('dog')
    setNewBreed('')
    setNewAge('')
    setNewBirthday('')
    setNewNotes('')
    setNewVetName('')
    setNewVetPhone('')
    setNewPhoto('')
    setShowAddForm(false)
    showToast('Pet added', 'success')
  }

  const updatePet = (updated: Pet) => {
    try {
      savePets(pets.map((pet) => (pet.id === updated.id ? updated : pet)))
      showToast('Pet updated', 'success')
    } catch (error) {
      showToast('Couldn\'t update pet', 'error')
    }
  }

  const deletePet = (id: string) => {
    try {
      savePets(pets.filter((pet) => pet.id !== id))
      showToast('Pet deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete pet', 'error')
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'pets') {
      // Pet was already created by petsHandler.create() in routeIntent
      loadPets()
      showToast('Pet added', 'success')
    }
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/people" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to People
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pets</h1>
            <p className="text-sm text-gray-500">Your furry friends</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>

        <AIInputBar onIntent={handleAIIntent} />

        {showAddForm && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Pet</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="pet-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="pet-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Max"
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newName.trim()) {
                        addPet()
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AIPen
                      text={newName}
                      onPolished={(polished) => setNewName(polished)}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pet-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="pet-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="fish">Fish</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pet-age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age (optional)
                  </label>
                  <input
                    id="pet-age"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="Age"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-700 mb-1">
                  Breed (optional)
                </label>
                <input
                  id="pet-breed"
                  type="text"
                  value={newBreed}
                  onChange={(e) => setNewBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="pet-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    id="pet-notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Additional information..."
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <div className="absolute right-2 top-2">
                    <AIPen
                      text={newNotes}
                      onPolished={(polished) => setNewNotes(polished)}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPet}
                  disabled={!newName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Pet
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewName('')
                    setNewType('dog')
                    setNewBreed('')
                    setNewAge('')
                    setNewNotes('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {pets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-2">No pets yet</p>
            <p className="text-sm text-gray-400 mb-6">Add your first pet to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              <span>Add Pet</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onUpdate={updatePet}
                onDelete={deletePet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
