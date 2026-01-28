'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { showToast } from '../feedback/ToastContainer'
import AIPen from '../AIPen'
import AppModal from '../modals/AppModal'

interface ThoughtCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  onSave: (thought: string) => void
}

export default function ThoughtCreateSheet({ isOpen, onClose, onSave }: ThoughtCreateSheetProps) {
  const [thought, setThought] = useState('')

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
    <AppModal isOpen={isOpen} onClose={onClose} variant="bottom" className="flex flex-col transition-all duration-250" style={{ backgroundColor: 'var(--card-bg)' }}>
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-12 h-1 rounded-full transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
        <h2 id="modal-title" className="text-xl font-semibold transition-all duration-250" style={{ color: 'var(--text-primary)' }}>Quick Thought</h2>
        <button
          onClick={onClose}
          className="p-2 transition-all duration-250 hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close"
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
            className="w-full px-4 py-3 pr-10 min-h-[150px] border-0 focus:outline-none focus:ring-0 bg-transparent resize-none transition-all duration-250"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          <style jsx>{`
            textarea::placeholder {
              color: var(--text-muted);
            }
          `}</style>
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
      <div className="px-6 py-4 border-t flex items-center justify-end gap-3 transition-all duration-250" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={onClose}
          className="px-4 py-2 transition-all duration-250 hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!thought.trim()}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 flex items-center gap-2"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <Save className="w-4 h-4" strokeWidth={2} />
          <span>Save</span>
        </button>
      </div>
    </AppModal>
  )
}
