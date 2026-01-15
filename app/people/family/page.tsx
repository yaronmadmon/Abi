'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, User } from 'lucide-react'
import type { FamilyMember } from '@/types/home'
import AIInputBar from '@/components/AIInputBar'
import AIPen from '@/components/AIPen'
import FamilyMemberCard from '@/components/people/FamilyMemberCard'
import { showToast } from '@/components/feedback/ToastContainer'

export default function FamilyPage() {
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelationship, setNewRelationship] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadFamily()
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'family') {
        loadFamily()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadFamily = () => {
    try {
      const stored = localStorage.getItem('family')
      if (stored) {
        const parsed = JSON.parse(stored)
        setFamily(parsed)
        console.log('✅ Loaded family members:', parsed.length)
      } else {
        setFamily([])
      }
    } catch (error) {
      console.error('❌ Error loading family:', error)
      setFamily([])
    }
  }

  const saveFamily = (newFamily: FamilyMember[]) => {
    localStorage.setItem('family', JSON.stringify(newFamily))
    setFamily(newFamily)
    // Trigger storage event
    window.dispatchEvent(new Event('storage'))
  }

  const addFamilyMember = () => {
    if (!newName.trim()) {
      return
    }

    const familyMember: FamilyMember = {
      id: `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName.trim(),
      relationship: newRelationship.trim() || undefined,
      age: newAge ? parseInt(newAge) : undefined,
      notes: newNotes.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      photo: newPhoto || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveFamily([...family, familyMember])
    setNewName('')
    setNewRelationship('')
    setNewAge('')
    setNewNotes('')
    setNewPhone('')
    setNewEmail('')
    setNewPhoto('')
    setShowAddForm(false)
    showToast('Family member added', 'success')
  }

  const updateFamilyMember = (updated: FamilyMember) => {
    try {
      saveFamily(family.map((member) => (member.id === updated.id ? updated : member)))
      showToast('Family member updated', 'success')
    } catch (error) {
      showToast('Couldn\'t update family member', 'error')
    }
  }

  const deleteFamilyMember = (id: string) => {
    try {
      saveFamily(family.filter((member) => member.id !== id))
      showToast('Family member deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete family member', 'error')
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'family') {
      // Family member was already created by familyHandler.create() in routeIntent
      loadFamily()
      showToast('Family member added', 'success')
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Family</h1>
            <p className="text-sm text-gray-500">Household members</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Sarah"
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newName.trim()) {
                        addFamilyMember()
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
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship (optional)
                </label>
                <input
                  id="relationship"
                  type="text"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  placeholder="e.g., daughter, spouse, parent"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age (optional)
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="Age"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
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
                  onClick={addFamilyMember}
                  disabled={!newName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Family Member
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewName('')
                    setNewRelationship('')
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

        {family.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-2">No family members yet</p>
            <p className="text-sm text-gray-400 mb-6">Add your first family member to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              <span>Add Family Member</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {family.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                onUpdate={updateFamilyMember}
                onDelete={deleteFamilyMember}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
