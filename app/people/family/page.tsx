'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, User } from 'lucide-react'
import type { FamilyMember } from '@/types/home'
import AIPen from '@/components/AIPen'
import FamilyMemberCard from '@/components/people/FamilyMemberCard'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'
import { logger } from '@/lib/logger'

export default function FamilyPage() {
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelationship, setNewRelationship] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newBirthday, setNewBirthday] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhoto, setNewPhoto] = useState('')
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
        logger.debug(`Loaded family members: ${parsed.length}`)
      } else {
        setFamily([])
      }
    } catch (error) {
      logger.error('Error loading family', error as Error)
      setFamily([])
    }
  }

  const saveFamily = (newFamily: FamilyMember[]) => {
    try {
      // Calculate total size before saving
      const jsonString = JSON.stringify(newFamily)
      const sizeInMB = (jsonString.length / (1024 * 1024)).toFixed(2)
      logger.debug(`Family data size: ${sizeInMB} MB`)

      // Check if data is too large (localStorage limit is ~5-10MB)
      if (jsonString.length > 4 * 1024 * 1024) { // 4MB warning threshold
        logger.warn(`Warning: Family data is getting large: ${sizeInMB} MB`)
        // Optionally remove photos from older members to free up space
        if (jsonString.length > 8 * 1024 * 1024) { // 8MB hard limit
          showToast('Data too large. Consider removing some photos.', 'error')
          // Remove photos from all members to reduce size
          const familyWithoutPhotos = newFamily.map((member) => ({
            ...member,
            photo: undefined,
          }))
          const reducedJson = JSON.stringify(familyWithoutPhotos)
          localStorage.setItem('family', reducedJson)
          setFamily(familyWithoutPhotos)
          showToast('Photos removed to save space. You can re-add them later.', 'info')
          window.dispatchEvent(new Event('storage'))
          return
        }
      }

      localStorage.setItem('family', jsonString)
      setFamily(newFamily)
      logger.debug(`Family saved successfully: ${newFamily.length} members`)
      // Trigger storage event
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      logger.error('Error saving family to localStorage', error as Error)
      // Check if it's a quota exceeded error
      if (error instanceof Error && (error.name === 'QuotaExceededError' || (error as any).code === 22)) {
        // Try to save without photos
        try {
          const familyWithoutPhotos = newFamily.map((member) => ({
            ...member,
            photo: undefined,
          }))
          const reducedJson = JSON.stringify(familyWithoutPhotos)
          localStorage.setItem('family', reducedJson)
          setFamily(familyWithoutPhotos)
          showToast('Storage full. Photos removed to save space. You can re-add them later.', 'info')
          window.dispatchEvent(new Event('storage'))
        } catch (retryError) {
          showToast('Storage is full. Please clear browser data or remove some family members.', 'error')
        }
      } else {
        showToast('Failed to save family member', 'error')
      }
      throw error // Re-throw to be caught by caller
    }
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
      birthday: newBirthday.trim() || undefined,
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
    setNewBirthday('')
    setNewNotes('')
    setNewPhone('')
    setNewEmail('')
    setNewPhoto('')
    setShowAddForm(false)
    showToast('Family member added! Welcome to the family! 👋', 'success')
  }

  const updateFamilyMember = (updated: FamilyMember) => {
    try {
      // Validate the updated member
      if (!updated.id) {
        logger.error('Missing member ID')
        showToast('Missing member ID', 'error')
        return
      }

      if (!updated.name || !updated.name.trim()) {
        logger.error('Missing or empty name')
        showToast('Name is required', 'error')
        return
      }

      // Check if member exists
      const memberExists = family.some((member) => member.id === updated.id)
      if (!memberExists) {
        logger.error('Member not found', new Error(updated.id))
        showToast('Family member not found', 'error')
        return
      }

      // Find the member and update it
      const updatedFamily = family.map((member) => {
        if (member.id === updated.id) {
          const cleaned = {
            ...updated,
            id: updated.id, // Ensure ID is preserved
            name: updated.name.trim(),
            relationship: updated.relationship?.trim() || undefined,
            age: updated.age,
            birthday: updated.birthday?.trim() || undefined,
            notes: updated.notes?.trim() || undefined,
            phone: updated.phone?.trim() || undefined,
            email: updated.email?.trim() || undefined,
            photo: updated.photo || undefined,
            createdAt: updated.createdAt || member.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString(),
          }
          logger.debug('Updating member', { memberId: cleaned.id, name: cleaned.name })
          return cleaned
        }
        return member
      })

      saveFamily(updatedFamily)
      showToast('Family member updated', 'success')
    } catch (error) {
      logger.error('Error updating family member', error as Error)
      showToast(`Couldn't update family member: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
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


  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/people" className="text-sm mb-2 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              ← Back to People
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Family</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Household members</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-250"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">Add Family Member</span>
          </button>
        </div>

        {showAddForm && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Family Member</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Sarah"
                    className="w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-250"
                    style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
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
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday (optional)
                  </label>
                  <input
                    id="birthday"
                    type="date"
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g., name@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    setNewBirthday('')
                    setNewNotes('')
                    setNewPhone('')
                    setNewEmail('')
                    setNewPhoto('')
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
            <p className="text-gray-500 mb-2">No family members yet. Let's add your first one!</p>
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
      </PageContainer>
    </div>
  )
}
