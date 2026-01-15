'use client'

import { useState, useRef } from 'react'
import { Edit2, Save, X, Camera, Heart, Phone, Trash2 } from 'lucide-react'
import type { Pet } from '@/types/home'
import { showToast } from '../feedback/ToastContainer'

interface PetCardProps {
  pet: Pet
  onUpdate: (updated: Pet) => void
  onDelete: (id: string) => void
}

export default function PetCard({ pet, onUpdate, onDelete }: PetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(pet.name)
  const [type, setType] = useState(pet.type)
  const [breed, setBreed] = useState(pet.breed || '')
  const [age, setAge] = useState(pet.age?.toString() || '')
  const [birthday, setBirthday] = useState(pet.birthday || '')
  const [notes, setNotes] = useState(pet.notes || '')
  const [vetName, setVetName] = useState(pet.vetName || '')
  const [vetPhone, setVetPhone] = useState(pet.vetPhone || '')
  const [photo, setPhoto] = useState(pet.photo || '')
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
          onUpdate({ ...pet, photo: base64, updatedAt: new Date().toISOString() })
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
      onUpdate({
        ...pet,
        name: name.trim(),
        type: type,
        breed: breed.trim() || undefined,
        age: age ? parseInt(age) : undefined,
        birthday: birthday.trim() || undefined,
        notes: notes.trim() || undefined,
        vetName: vetName.trim() || undefined,
        vetPhone: vetPhone.trim() || undefined,
        photo: photo || undefined,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)
      showToast('Pet updated', 'success')
    } catch (error) {
      showToast('Couldn\'t update pet', 'error')
    }
  }

  const handleCancel = () => {
    setName(pet.name)
    setType(pet.type)
    setBreed(pet.breed || '')
    setAge(pet.age?.toString() || '')
    setBirthday(pet.birthday || '')
    setNotes(pet.notes || '')
    setVetName(pet.vetName || '')
    setVetPhone(pet.vetPhone || '')
    setPhoto(pet.photo || '')
    setIsEditing(false)
  }

  const handleVetCall = () => {
    if (vetPhone) {
      try {
        window.location.href = `tel:${vetPhone}`
        showToast('Opening phone app', 'info')
      } catch (error) {
        showToast('Couldn\'t make call', 'error')
      }
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <Heart className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
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
                placeholder="Pet name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Breed (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="Birthday (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Veterinarian Info</p>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="Vet name (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />
                <input
                  type="text"
                  value={vetPhone}
                  onChange={(e) => setVetPhone(e.target.value)}
                  placeholder="Vet phone (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (medical, feeding, etc.)"
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{pet.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="capitalize">{pet.type}</span>
                    {pet.breed && <span>• {pet.breed}</span>}
                    {pet.age && <span>• {pet.age} years old</span>}
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
                      if (confirm(`Delete ${pet.name}?`)) {
                        onDelete(pet.id)
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {pet.notes && (
                <p className="text-sm text-gray-600 mb-3">{pet.notes}</p>
              )}

              {/* Vet Info */}
              {(pet.vetName || pet.vetPhone) && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Veterinarian</p>
                  {pet.vetName && (
                    <p className="text-sm text-gray-700 mb-1">{pet.vetName}</p>
                  )}
                  {pet.vetPhone && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700">{pet.vetPhone}</p>
                      <button
                        onClick={handleVetCall}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Call vet"
                      >
                        <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
