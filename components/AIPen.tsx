'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { PolishStyle } from '@/ai/textPolisher'

interface AIPenProps {
  text: string
  onPolished: (polishedText: string) => void
  disabled?: boolean
  className?: string
}

export default function AIPen({ text, onPolished, disabled, className = '' }: AIPenProps) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handlePolish = async (style: PolishStyle = 'polish') => {
    if (!text.trim() || isPolishing) return

    setIsPolishing(true)
    setShowMenu(false)

    try {
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      })

      if (!response.ok) {
        throw new Error('Failed to polish text')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      if (data.polished) {
        onPolished(data.polished)
      }
    } catch (error) {
      console.error('Failed to polish text:', error)
      // Silently fail - don't interrupt user flow
    } finally {
      setIsPolishing(false)
    }
  }

  const isDisabled = disabled || !text.trim() || isPolishing

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (isDisabled) return
          // Show menu on desktop, direct polish on mobile
          if (window.innerWidth >= 768) {
            setShowMenu(!showMenu)
          } else {
            handlePolish('polish')
          }
        }}
        disabled={isDisabled}
        className={`
          p-1.5 rounded-md transition-all duration-250
          ${isDisabled 
            ? 'opacity-30 cursor-not-allowed' 
            : 'opacity-60 hover:opacity-100 hover:bg-white/10 active:bg-white/15'
          }
        `}
        title={isDisabled ? 'Write something first' : 'Let Abby polish this'}
      >
        {isPolishing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
        ) : (
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
        )}
      </button>

      {/* Quick Options Menu */}
      {showMenu && !isDisabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          <div 
            className="absolute right-0 bottom-full mb-2 z-20 rounded-xl py-1 min-w-[140px]"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <button
              onClick={() => handlePolish('polish')}
              className="w-full text-left px-3 py-2 text-sm transition-colors duration-250 hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              ✨ Polish
            </button>
            <button
              onClick={() => handlePolish('shorten')}
              className="w-full text-left px-3 py-2 text-sm transition-colors duration-250 hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              📝 Shorten
            </button>
            <button
              onClick={() => handlePolish('friendlier')}
              className="w-full text-left px-3 py-2 text-sm transition-colors duration-250 hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              😊 Make friendlier
            </button>
            <button
              onClick={() => handlePolish('professional')}
              className="w-full text-left px-3 py-2 text-sm transition-colors duration-250 hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              💼 Make professional
            </button>
          </div>
        </>
      )}
    </div>
  )
}
