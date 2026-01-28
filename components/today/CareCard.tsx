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
    <div 
      className="glass-card p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 158, 255, 0.1) 0%, rgba(139, 158, 255, 0.05) 100%)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Take a moment</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{suggestion}</p>
          <button
            onClick={handleReset}
            disabled={isActive}
            className="text-xs font-medium px-4 py-2 rounded-full transition-all duration-250 card-press"
            style={{
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              color: isActive ? 'var(--text-muted)' : 'var(--accent-primary)',
              border: isActive ? 'none' : '1px solid var(--glass-border)'
            }}
          >
            {isActive ? 'Taking a moment...' : 'Take 2 minutes'}
          </button>
        </div>
        <span className="text-2xl">🌿</span>
      </div>
    </div>
  )
}
