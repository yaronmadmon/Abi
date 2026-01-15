'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { showToast } from '../feedback/ToastContainer'
import AIPen from '../AIPen'

interface ThoughtCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  onSave: (thought: string) => void
}

export default function ThoughtCreateSheet({ isOpen, onClose, onSave }: ThoughtCreateSheetProps) {
  const [thought, setThought] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    if (thought.trim()) {
      try {
        onSave(thought.trim())
        showToast('Thought saved', 'success')
        setThought('')
        onClose()
      } catch (error) {
        showToast('Couldn\'t save thought', 'error')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-end">
      <div className="relative w-full rounded-t-3xl shadow-soft-lg max-h-[60vh] flex flex-col" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Quick Thought</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 pr-10 min-h-[150px] border-0 focus:outline-none focus:ring-0 bg-transparent resize-none"
              autoFocus
            />
            <div className="absolute right-2 top-2">
              <AIPen
                text={thought}
                onPolished={(polished) => setThought(polished)}
                disabled={false}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!thought.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}
