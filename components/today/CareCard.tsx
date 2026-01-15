'use client'

import { useState, useEffect } from 'react'

const careSuggestions = [
  'Take 3 deep breaths',
  'Step outside for fresh air',
  'Drink a glass of water',
  'Stretch for 2 minutes',
  'Close your eyes and rest',
]

export default function CareCard() {
  const [suggestion, setSuggestion] = useState<string>('Take a moment to breathe')
  const [isActive, setIsActive] = useState(false)

  // Generate suggestion only on client side to avoid hydration mismatch
  useEffect(() => {
    setSuggestion(careSuggestions[Math.floor(Math.random() * careSuggestions.length)])
  }, [])

  const handleReset = () => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), 120000) // 2 minutes
  }

  return (
    <div className="glass-card p-5 mb-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-100/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Take a moment</h3>
          <p className="text-xs text-gray-600 mb-3">{suggestion}</p>
          <button
            onClick={handleReset}
            disabled={isActive}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gray-200 text-gray-500'
                : 'bg-white/80 text-purple-700 hover:bg-white active:scale-95'
            }`}
          >
            {isActive ? 'Taking a moment...' : 'Take 2 minutes'}
          </button>
        </div>
        <span className="text-2xl">🌿</span>
      </div>
    </div>
  )
}
