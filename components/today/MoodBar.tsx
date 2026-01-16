'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😄', label: 'Great' },
  { emoji: '😕', label: 'Okay' },
  { emoji: '😎', label: 'Confident' },
  { emoji: '🤔', label: 'Thoughtful' },
]

export default function MoodBar() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showInput, setShowInput] = useState(false)
  const [quickNote, setQuickNote] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Load saved mood (only for this session, not persisted)
  useEffect(() => {
    const savedMood = sessionStorage.getItem('todayMood')
    if (savedMood) {
      setSelectedMood(savedMood)
    }
  }, [])

  const handleMoodSelect = (emoji: string) => {
    setSelectedMood(emoji)
    sessionStorage.setItem('todayMood', emoji)
    setShowInput(true)
    setIsExpanded(true)
  }

  const handleClear = () => {
    setSelectedMood(null)
    setShowInput(false)
    setQuickNote('')
    setIsExpanded(false)
    sessionStorage.removeItem('todayMood')
    sessionStorage.removeItem('todayNote')
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = value.split(/\s+/).filter(w => w.length > 0)
    
    // Limit to 10 words
    if (words.length > 10) {
      const limitedWords = words.slice(0, 10).join(' ')
      setQuickNote(limitedWords)
      sessionStorage.setItem('todayNote', limitedWords)
    } else {
      setQuickNote(value)
      if (value.trim()) {
        sessionStorage.setItem('todayNote', value)
      } else {
        sessionStorage.removeItem('todayNote')
      }
    }
  }

  // Load saved note
  useEffect(() => {
    const savedNote = sessionStorage.getItem('todayNote')
    if (savedNote) {
      setQuickNote(savedNote)
      setShowInput(true)
      setIsExpanded(true)
    }
  }, [])

  if (!isExpanded && !selectedMood) {
    return (
      <div className="glass-card p-3 mb-4 cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setIsExpanded(true)}>
        <p className="text-sm text-gray-500 text-center">How are you feeling? (optional)</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">How are you feeling?</p>
        {selectedMood && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Emoji Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {MOOD_EMOJIS.map((mood) => (
          <button
            key={mood.emoji}
            onClick={() => handleMoodSelect(mood.emoji)}
            className={`text-2xl p-2 rounded-lg transition-all ${
              selectedMood === mood.emoji
                ? 'bg-blue-50 scale-110'
                : 'hover:bg-gray-50 hover:scale-105'
            }`}
            title={mood.label}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {/* Optional "Tell me in 10 words" input */}
      {showInput && (
        <div className="mt-3 animate-slide-up">
          <input
            type="text"
            value={quickNote}
            onChange={handleNoteChange}
            placeholder="Tell me in 10 words (optional)"
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            {quickNote.length > 0 && `${quickNote.split(/\s+/).filter(w => w).length}/10 words`}
          </p>
        </div>
      )}
    </div>
  )
}
