'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, CheckSquare, Bell, Calendar, FileText } from 'lucide-react'

type CaptureType = 'thought' | 'task' | 'reminder' | 'appointment' | 'note'

interface IconComponent {
  type: CaptureType
  label: string
  Icon: React.ComponentType<any>
}

// Memoized because: Renders 5 buttons on Today page, no props/state changes,
// pure presentation component that never needs to re-render after mount.
// Remove memo if: Buttons become dynamic or need to react to app state.
const QuickCaptureRow = memo(function QuickCaptureRow() {
  const router = useRouter()

  const captureOptions: IconComponent[] = [
    { type: 'thought', label: 'Thought', Icon: Lightbulb },
    { type: 'task', label: 'To-Do', Icon: CheckSquare },
    { type: 'reminder', label: 'Reminder', Icon: Bell },
    { type: 'appointment', label: 'Appointment', Icon: Calendar },
    { type: 'note', label: 'Note', Icon: FileText },
  ]

  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Capture</h3>
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
        {captureOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => router.push(`/capture?type=${option.type}`)}
            className="flex flex-col items-center justify-center gap-2 min-w-[70px] p-3 rounded-xl bg-white/60 hover:bg-white/80 card-press transition-all duration-200"
          >
            <option.Icon className="w-5 h-5" style={{ color: 'var(--icon-color)' }} strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-700">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

export default QuickCaptureRow
