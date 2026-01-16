'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/feedback/ToastContainer'
import AIInputBar from '@/components/AIInputBar'

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadNotes()
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notes') {
        loadNotes()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom update events
    const handleNotesUpdate = () => {
      loadNotes()
    }
    window.addEventListener('notesUpdated', handleNotesUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('notesUpdated', handleNotesUpdate)
    }
  }, [])

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem('notes')
      if (stored) {
        const parsed = JSON.parse(stored) as Note[]
        // Sort by: pinned first, then by updatedAt (most recent first)
        const sorted = parsed.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
        setNotes(sorted)
      } else {
        setNotes([])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      setNotes([])
    }
  }

  const handleCreateNote = () => {
    // Create new note and navigate to editor
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    }
    
    // Save to localStorage
    const stored = localStorage.getItem('notes') || '[]'
    const existingNotes = JSON.parse(stored)
    existingNotes.push(newNote)
    localStorage.setItem('notes', JSON.stringify(existingNotes))
    
    // Trigger update event
    window.dispatchEvent(new Event('notesUpdated'))
    
    // Navigate to editor
    router.push(`/dashboard/notes/${newNote.id}`)
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'notes') {
      // Refresh notes list
      loadNotes()
      // If note has an id, navigate to editor
      if (payload?.id) {
        router.push(`/dashboard/notes/${payload.id}`)
      }
    }
  }

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const updated = notes.filter(note => note.id !== id)
      localStorage.setItem('notes', JSON.stringify(updated))
      loadNotes()
      showToast('Note deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete note', 'error')
    }
  }

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const updated = notes.map(note => 
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
      localStorage.setItem('notes', JSON.stringify(updated))
      loadNotes()
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  const getPreview = (body: string) => {
    if (!body) return 'No additional text'
    const lines = body.split('\n').filter(line => line.trim())
    return lines[0] || 'No additional text'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl px-6 py-4 border-b border-gray-200/50" style={{ backgroundColor: 'var(--background)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            </div>
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">New Note</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="px-6 py-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNote}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Create Note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/dashboard/notes/${note.id}`}
                  className="block glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.pinned && (
                          <span className="text-xs text-blue-600 font-medium">📌</span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {note.title || 'Untitled Note'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {getPreview(note.body)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => togglePin(note.id, e)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        {note.pinned ? '📌' : '📍'}
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Input - Note creation */}
        <AIInputBar onIntent={handleAIIntent} context="note" />
      </div>
    </div>
  )
}
