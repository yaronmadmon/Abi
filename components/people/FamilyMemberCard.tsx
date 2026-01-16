'use client'

import { useState, useRef } from 'react'
import { Phone, Mail, MessageSquare, Edit2, Save, X, Camera, User, Trash2, Calendar } from 'lucide-react'
import type { FamilyMember } from '@/types/home'
import { showToast } from '../feedback/ToastContainer'

interface FamilyMemberCardProps {
  member: FamilyMember
  onUpdate: (updated: FamilyMember) => void
  onDelete: (id: string) => void
}

export default function FamilyMemberCard({ member, onUpdate, onDelete }: FamilyMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(member.name)
  const [relationship, setRelationship] = useState(member.relationship || '')
  const [age, setAge] = useState(member.age?.toString() || '')
  const [birthday, setBirthday] = useState(member.birthday || '')
  const [notes, setNotes] = useState(member.notes || '')
  const [phone, setPhone] = useState(member.phone || '')
  const [email, setEmail] = useState(member.email || '')
  const [photo, setPhoto] = useState(member.photo || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPhoto(base64)
        if (!isEditing) {
          // Auto-save photo if not in edit mode
          onUpdate({ ...member, photo: base64, updatedAt: new Date().toISOString() })
        }
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    try {
      // Validate and parse age
      let parsedAge: number | undefined = undefined
      if (age && age.trim()) {
        const ageNum = parseInt(age.trim())
        if (!isNaN(ageNum) && ageNum > 0) {
          parsedAge = ageNum
        }
      }

      // Validate birthday format
      let validBirthday: string | undefined = undefined
      if (birthday && birthday.trim()) {
        const date = new Date(birthday.trim())
        if (!isNaN(date.getTime())) {
          // Store as YYYY-MM-DD format
          validBirthday = birthday.trim()
        }
      }

      onUpdate({
        ...member,
        name: name.trim(),
        relationship: relationship.trim() || undefined,
        age: parsedAge,
        birthday: validBirthday,
        notes: notes.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        photo: photo || undefined,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)
      // Don't show toast here - onUpdate will handle it
    } catch (error) {
      console.error('Error updating family member:', error)
      showToast('Couldn\'t update family member', 'error')
    }
  }

  const handleCancel = () => {
    setName(member.name)
    setRelationship(member.relationship || '')
    setAge(member.age?.toString() || '')
    setBirthday(member.birthday || '')
    setNotes(member.notes || '')
    setPhone(member.phone || '')
    setEmail(member.email || '')
    setPhoto(member.photo || '')
    setIsEditing(false)
  }

  const handleCall = () => {
    if (member.phone) {
      window.location.href = `tel:${member.phone}`
    }
  }

  const handleText = () => {
    if (member.phone) {
      window.location.href = `sms:${member.phone}`
    }
  }

  const handleEmail = () => {
    if (member.email) {
      window.location.href = `mailto:${member.email}`
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
              />
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Relationship (optional)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age (optional)"
                  min="0"
                  max="150"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={birthday || ''}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="Birthday (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  {member.relationship && (
                    <p className="text-sm text-gray-600 capitalize mb-1">{member.relationship}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {member.age && (
                      <span>{member.age} years old</span>
                    )}
                    {member.birthday && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{new Date(member.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${member.name}?`)) {
                        onDelete(member.id)
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Contact Info - Always show contact section */}
              <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
                {member.phone && member.phone.trim() ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Phone className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span className="text-sm text-gray-700">{member.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-300" strokeWidth={2} />
                    <span className="text-sm text-gray-400 italic">No phone number</span>
                  </div>
                )}
                {member.email && member.email.trim() ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Mail className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span className="text-sm text-gray-700">{member.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-300" strokeWidth={2} />
                    <span className="text-sm text-gray-400 italic">No email address</span>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {member.notes && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.notes}</p>
                </div>
              )}

              {/* Quick Actions - Always show action buttons (disabled if no contact info) */}
              <div className="flex gap-2 mt-3">
                {member.phone && member.phone.trim() ? (
                  <>
                    <button
                      onClick={handleCall}
                      className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      title={`Call ${member.phone}`}
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                    <button
                      onClick={handleText}
                      className="flex-1 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      title={`Text ${member.phone}`}
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Text</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      title="Add phone number to enable"
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      title="Add phone number to enable"
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Text</span>
                    </button>
                  </>
                )}
                {member.email && member.email.trim() ? (
                  <button
                    onClick={handleEmail}
                    className="flex-1 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    title={`Email ${member.email}`}
                  >
                    <Mail className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    title="Add email address to enable"
                  >
                    <Mail className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
