'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppModal from '../modals/AppModal'

interface PlanSomethingSheetProps {
  isOpen: boolean
  onClose: () => void
}

type PlanType = 'trip' | 'budget' | 'event' | 'wishlist' | 'home-project'

export default function PlanSomethingSheet({ isOpen, onClose }: PlanSomethingSheetProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PlanType | null>(null)


  const planOptions: { type: PlanType; label: string; icon: string; route: string }[] = [
    { type: 'trip', label: 'Trip', icon: '✈️', route: '/home' },
    { type: 'budget', label: 'Budget', icon: '💰', route: '/finance' },
    { type: 'event', label: 'Event', icon: '🎉', route: '/home' },
    { type: 'wishlist', label: 'Wish list', icon: '⭐', route: '/home' },
    { type: 'home-project', label: 'Home project', icon: '🏗️', route: '/home' },
  ]

  const handleSelect = (option: typeof planOptions[0]) => {
    setSelectedType(option.type)
    // In future: launch AI-guided flow
    // For now: navigate to relevant section
    router.push(option.route)
    setTimeout(() => {
      onClose()
      setSelectedType(null)
    }, 300)
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} variant="bottom" className="flex flex-col max-h-[70vh] transition-all duration-250" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 id="modal-title" className="text-xl font-semibold transition-all duration-250" style={{ color: 'var(--text-primary)' }}>Plan Something</h2>
          <p className="text-sm mt-1 transition-all duration-250" style={{ color: 'var(--text-secondary)' }}>What would you like to plan?</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {planOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleSelect(option)}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-250 active:scale-95 hover:opacity-80"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <span className="text-4xl">{option.icon}</span>
                <span className="text-sm font-medium transition-all duration-250" style={{ color: 'var(--text-primary)' }}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
    </AppModal>
  )
}
