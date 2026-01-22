'use client'

import { useState } from 'react'
import { logger } from '@/lib/logger'
import { X, Save } from 'lucide-react'
import AIPen from '../AIPen'
import AppModal from '../modals/AppModal'
import { showToast } from '../feedback/ToastContainer'

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

interface NoteCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: { title: string; body: string }) => void
}

export default function NoteCreateSheet({ isOpen, onClose, onSave }: NoteCreateSheetProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)


  const handleSave = async () => {
    try {
      if (!title.trim() && !body.trim()) {
        console.warn('⚠️ NoteCreateSheet: Cannot save empty note');
        return;
      }

      setIsSaving(true);
      logger.debug('NoteCreateSheet: Saving note', { title: title.trim() || 'Untitled Note', bodyLength: body.trim().length });
      
      // Call onSave callback
      onSave({
        title: title.trim() || 'Untitled Note',
        body: body.trim(),
      })
      
      // Small delay to show save state, then reset and close
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Reset
      setTitle('')
      setBody('')
      setIsSaving(false);
      showToast('Note saved', 'success')
      onClose()
    } catch (error) {
      console.error('❌ NoteCreateSheet: Save error:', error);
      setIsSaving(false);
      showToast('Couldn\'t save note', 'error')
    }
  }

  const handleCancel = () => {
    // Reset form on cancel
    setTitle('')
    setBody('')
    onClose()
  }


  return (
    <AppModal isOpen={isOpen} onClose={onClose} variant="bottom" className="flex flex-col" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-0.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header - Compact */}
        <div className="px-4 py-2.5 border-b border-gray-100/50 flex items-center justify-between">
          <h2 id="modal-title" className="text-base font-medium text-gray-700">New Note</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content - Apple Notes style: constrained width, natural margins */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="space-y-3">
              {/* Title - Larger, single line */}
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full pr-8 text-2xl font-semibold text-gray-900 border-0 focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400"
                  autoFocus
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <AIPen
                    text={title}
                    onPolished={(polished) => setTitle(polished)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Body - Comfortable reading width, natural height */}
              <div className="relative">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Start writing..."
                  className="w-full pr-8 text-base text-gray-700 leading-relaxed border-0 focus:outline-none focus:ring-0 bg-transparent resize-none placeholder:text-gray-400"
                  style={{ 
                    fontFamily: 'inherit',
                    minHeight: '200px',
                  }}
                />
                <div className="absolute right-0 top-2">
                  <AIPen
                    text={body}
                    onPolished={(polished) => setBody(polished)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="px-4 py-3 border-t border-gray-100/50 flex items-center justify-end gap-2 bg-white/50">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={(!title.trim() && !body.trim()) || isSaving}
            className="px-5 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
    </AppModal>
  )
}
