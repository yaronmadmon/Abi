'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PlanSomethingSheetProps {
  isOpen: boolean
  onClose: () => void
}

type PlanType = 'trip' | 'budget' | 'event' | 'wishlist' | 'home-project'

export default function PlanSomethingSheet({ isOpen, onClose }: PlanSomethingSheetProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PlanType | null>(null)

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-[100] flex items-end" style={{ animation: 'fadeIn 200ms ease-in-out' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full rounded-t-3xl shadow-soft-lg max-h-[70vh] flex flex-col" style={{ backgroundColor: 'var(--card-bg)', animation: 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Plan Something</h2>
          <p className="text-sm text-gray-500 mt-1">What would you like to plan?</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {planOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleSelect(option)}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 hover:border-blue-200 hover:shadow-soft transition-all duration-200 active:scale-95"
              >
                <span className="text-4xl">{option.icon}</span>
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
