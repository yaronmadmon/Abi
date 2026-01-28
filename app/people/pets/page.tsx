'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'
import type { Pet } from '@/types/home'
import AIPen from '@/components/AIPen'
import PetCard from '@/components/people/PetCard'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'
import { logger } from '@/lib/logger'

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('dog')
  const [newBreed, setNewBreed] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newBirthday, setNewBirthday] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newVetName, setNewVetName] = useState('')
  const [newVetPhone, setNewVetPhone] = useState('')
  const [newPhoto, setNewPhoto] = useState('')
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
        logger.debug(`Loaded pets: ${parsed.length}`)
      } else {
        setPets([])
      }
    } catch (error) {
      logger.error('Error loading pets', error as Error)
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


  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/people" className="text-sm mb-2 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              ← Back to People
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Pets</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your furry friends</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-250"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">Add a Pet</span>
          </button>
        </div>

        {showAddForm && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Pet</h2>
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
                <label htmlFor="pet-breed" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Breed (optional)
                </label>
                <input
                  id="pet-breed"
                  type="text"
                  value={newBreed}
                  onChange={(e) => setNewBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
              </div>
              <div>
                <label htmlFor="pet-birthday" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Birthday (optional)
                </label>
                <input
                  id="pet-birthday"
                  type="date"
                  value={newBirthday}
                  onChange={(e) => setNewBirthday(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
              </div>
              <div className="border-t pt-3" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Veterinarian Info (optional)</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newVetName}
                    onChange={(e) => setNewVetName(e.target.value)}
                    placeholder="Vet name"
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-250"
                    style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  />
                  <input
                    type="tel"
                    value={newVetPhone}
                    onChange={(e) => setNewVetPhone(e.target.value)}
                    placeholder="Vet phone"
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-250"
                    style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pet-notes" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    id="pet-notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Additional information..."
                    className="w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors duration-250"
                    style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
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
                  className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-250"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-primary)')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
                    setNewBirthday('')
                    setNewNotes('')
                    setNewVetName('')
                    setNewVetPhone('')
                    setNewPhoto('')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {pets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4" strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>No pets yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Add your first pet to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
      </PageContainer>
    </div>
  )
}
