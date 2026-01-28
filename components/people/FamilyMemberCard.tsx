'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, Mail, MessageSquare, Edit2, Save, X, Camera, User, Trash2, Calendar } from 'lucide-react'
import type { FamilyMember } from '@/types/home'
import { logger } from '@/lib/logger'
import ImageComponent from 'next/image'
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

  // Sync state with member prop when it changes (e.g., after navigation/reload)
  useEffect(() => {
    if (!isEditing) {
      setName(member.name)
      setRelationship(member.relationship || '')
      setAge(member.age?.toString() || '')
      setBirthday(member.birthday || '')
      setNotes(member.notes || '')
      setPhone(member.phone || '')
      setEmail(member.email || '')
      setPhoto(member.photo || '')
    }
  }, [member.id, member.photo, member.name, member.relationship, member.age, member.birthday, member.notes, member.phone, member.email, isEditing])

  const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedBase64)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Please use an image smaller than 5MB.', 'error')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      try {
        // Compress the image
        const compressedBase64 = await compressImage(file, 400, 400, 0.7)
        
        // Check compressed size (limit to 500KB base64)
        if (compressedBase64.length > 500 * 1024) {
          // Try more aggressive compression
          const moreCompressed = await compressImage(file, 300, 300, 0.6)
          setPhoto(moreCompressed)
          if (!isEditing) {
            onUpdate({ ...member, photo: moreCompressed, updatedAt: new Date().toISOString() })
          }
        } else {
          setPhoto(compressedBase64)
          if (!isEditing) {
            onUpdate({ ...member, photo: compressedBase64, updatedAt: new Date().toISOString() })
          }
        }
      } catch (error) {
        console.error('Error compressing image:', error)
        showToast('Could not process image. Please try a different image.', 'error')
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    try {
      // Validate name is not empty
      const trimmedName = name.trim()
      if (!trimmedName) {
        showToast('Name is required', 'error')
        return
      }

      // Validate and parse age
      let parsedAge: number | undefined = undefined
      if (age && age.trim()) {
        const ageNum = parseInt(age.trim())
        if (!isNaN(ageNum) && ageNum > 0 && ageNum <= 150) {
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

      // Prepare updated member
      const updatedMember: FamilyMember = {
        ...member,
        name: trimmedName,
        relationship: relationship.trim() || undefined,
        age: parsedAge,
        birthday: validBirthday,
        notes: notes.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        photo: photo && photo.trim() ? photo : undefined,
        updatedAt: new Date().toISOString(),
      }

      logger.debug('Saving member', { memberId: updatedMember.id, name: updatedMember.name })
      
      // Call onUpdate with the updated member
      onUpdate(updatedMember)
      setIsEditing(false)
    } catch (error) {
      logger.error('Error in handleSave', error as Error)
      showToast(`Couldn't update: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
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
          <div 
            className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity duration-250"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => !isEditing && setIsEditing(true)}
            title={!isEditing ? "Click to edit photo" : undefined}
          >
            {photo ? (
              <ImageComponent src={photo} alt={member.name} fill className="object-cover" unoptimized sizes="80px" />
            ) : (
              <User className="w-10 h-10" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 text-white rounded-full flex items-center justify-center transition-colors duration-250 shadow-sm z-10"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
            style={{ display: 'none' }}
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
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold transition-colors duration-250"
                style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              />
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Relationship (optional)"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors duration-250"
                style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
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
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
                <input
                  type="date"
                  value={birthday || ''}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="Birthday (optional)"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors duration-250"
                  style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm resize-none transition-colors duration-250"
                style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
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
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{member.notes}</p>
                </div>
              )}

              {/* Quick Actions - Always show action buttons (disabled if no contact info) */}
              <div className="flex gap-2 mt-3">
                {member.phone && member.phone.trim() ? (
                  <>
                    <button
                      onClick={handleCall}
                      className="flex-1 px-4 py-2.5 rounded-lg transition-colors duration-250 flex items-center justify-center gap-2 shadow-sm"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                      title={`Call ${member.phone}`}
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                    <button
                      onClick={handleText}
                      className="flex-1 px-4 py-2.5 rounded-lg transition-colors duration-250 flex items-center justify-center gap-2 shadow-sm"
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'}
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
                      className="flex-1 px-4 py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-250"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      title="Add phone number to enable"
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-250"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
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
                    className="flex-1 px-4 py-2.5 rounded-lg transition-colors duration-250 flex items-center justify-center gap-2 shadow-sm"
                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: 'rgb(168, 85, 247)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)'}
                    title={`Email ${member.email}`}
                  >
                    <Mail className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-4 py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-250"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
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
