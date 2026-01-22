'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calendar, Clock, User, Sparkles, Share2 } from 'lucide-react'
import AIPen from '../AIPen'
import { showToast } from '../feedback/ToastContainer'
import type { FamilyMember } from '@/types/home'

interface AppointmentCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  onSave: (appointment: {
    title: string
    date: string
    time: string
    location?: string
    forWho?: string
    sharedTo?: {
      id: string
      name: string
      email?: string
      phone?: string
    }
  }) => void
  initialDate?: string
}

export default function AppointmentCreateSheet({ isOpen, onClose, onSave, initialDate }: AppointmentCreateSheetProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDate || '')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [forWho, setForWho] = useState('')
  const [showAIAssist, setShowAIAssist] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  // Update date when initialDate changes or sheet opens
  useEffect(() => {
    if (initialDate && isOpen) {
      setDate(initialDate)
    }
  }, [initialDate, isOpen])

  // Load family members when sheet opens
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('family')
        if (stored) {
          const parsed = JSON.parse(stored) as FamilyMember[]
          setFamilyMembers(parsed)
        }
      } catch (error) {
        console.error('Error loading family members:', error)
        setFamilyMembers([])
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    if (title.trim() && date && time) {
      try {
        onSave({
          title: title.trim(),
          date,
          time,
          location: location.trim() || undefined,
          forWho: forWho.trim() || undefined,
          sharedTo: selectedFamilyMember ? {
            id: selectedFamilyMember.id,
            name: selectedFamilyMember.name,
            email: selectedFamilyMember.email,
            phone: selectedFamilyMember.phone,
          } : undefined,
        })
        showToast('Appointment added! 📅', 'success')
        // Reset
        setTitle('')
        setDate('')
        setTime('')
        setLocation('')
        setForWho('')
        setShowShare(false)
        setSelectedFamilyMember(null)
        onClose()
      } catch (error) {
        showToast('Couldn\'t create appointment. Try again?', 'error')
      }
    }
  }


  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-end">
      <div className="relative w-full rounded-t-3xl shadow-soft-lg max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">New Appointment</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIAssist(!showAIAssist)}
              className={`p-2 rounded-lg transition-colors ${
                showAIAssist
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Abby AI Assist"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Doctor appointment, Meeting with John"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AIPen
                    text={title}
                    onPolished={(polished) => setTitle(polished)}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" strokeWidth={2} />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" strokeWidth={2} />
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., 123 Main St, Conference Room A"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AIPen
                    text={location}
                    onPolished={(polished) => setLocation(polished)}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" strokeWidth={2} />
                Who is it for? (optional)
              </label>
              <select
                value={forWho}
                onChange={(e) => setForWho(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select person...</option>
                <option value="me">Me</option>
                <option value="family">Family</option>
                <option value="kids">Kids</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Share2 className="w-4 h-4 inline mr-1" strokeWidth={2} />
                  Share with family member (optional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowShare(!showShare)
                    if (showShare) {
                      setSelectedFamilyMember(null)
                    }
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showShare
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showShare ? 'Cancel' : 'Share'}
                </button>
              </div>
              {showShare && (
                <select
                  value={selectedFamilyMember?.id || ''}
                  onChange={(e) => {
                    const member = familyMembers.find(m => m.id === e.target.value)
                    setSelectedFamilyMember(member || null)
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select family member...</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedFamilyMember && (
                <p className="mt-2 text-xs text-gray-500">
                  Will share with {selectedFamilyMember.name}
                  {selectedFamilyMember.email && ` (${selectedFamilyMember.email})`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !date || !time}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}
