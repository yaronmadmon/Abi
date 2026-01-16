'use client'

import { useState } from 'react'
import { Lightbulb, CheckSquare, Bell, Calendar, FileText } from 'lucide-react'
import QuickCaptureSheet from '../sheets/QuickCaptureSheet'

type CaptureType = 'thought' | 'task' | 'reminder' | 'appointment' | 'note'

interface IconComponent {
  type: CaptureType
  label: string
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

export default function QuickCaptureRow() {
  const [openSheet, setOpenSheet] = useState<CaptureType | null>(null)

  const captureOptions: IconComponent[] = [
    { type: 'thought', label: 'Thought', Icon: Lightbulb },
    { type: 'task', label: 'To-Do', Icon: CheckSquare },
    { type: 'reminder', label: 'Reminder', Icon: Bell },
    { type: 'appointment', label: 'Appointment', Icon: Calendar },
    { type: 'note', label: 'Note', Icon: FileText },
  ]

  return (
    <>
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
          {captureOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setOpenSheet(option.type)}
              className="flex flex-col items-center justify-center gap-2 min-w-[70px] p-3 rounded-xl bg-white/60 hover:bg-white/80 card-press transition-all duration-200"
            >
              <option.Icon className="w-5 h-5 text-[#4a5568]" strokeWidth={1.5} />
              <span className="text-xs font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {openSheet && (
        <QuickCaptureSheet
          type={openSheet}
          isOpen={!!openSheet}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </>
  )
}
