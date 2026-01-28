'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'
import { logger } from '@/lib/logger'

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
    
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/Ctrl + N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
      // Forward slash to focus search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('notesUpdated', handleNotesUpdate)
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      logger.error('Error loading notes', error as Error)
      setNotes([])
    }
  }

  const handleCreateNote = () => {
    try {
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
    } catch (error) {
      logger.error('Failed to create note', error as Error)
      // Check if it's a quota exceeded error
      if (error instanceof Error && (error.name === 'QuotaExceededError' || (error as any).code === 22)) {
        showToast('Storage is full. Please clear browser data or remove some notes.', 'error')
      } else {
        showToast('Failed to create note. Please try again.', 'error')
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
      showToast('Note deleted ✓', 'success')
    } catch (error) {
      showToast('Couldn\'t delete that. Try again?', 'error')
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
      logger.error('Error toggling pin', error as Error)
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
      <PageContainer maxWidth="4xl">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl px-6 py-4 transition-colors duration-250" style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/today" className="transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                ← Back
              </Link>
              <h1 className="text-3xl font-bold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Notes</h1>
            </div>
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">Write a Note</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-250" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all duration-250"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 158, 255, 0.2)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="px-6 py-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto mb-4 transition-colors duration-250" strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-semibold mb-2 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                {searchQuery ? 'No notes found' : 'No notes yet. What\'s on your mind?'}
              </h3>
              <p className="text-sm mb-6 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNote}
                  className="px-6 py-3 text-white rounded-lg transition-colors duration-250 font-medium"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Create Note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <div key={note.id} className="relative glass-card hover:shadow-soft-lg transition-all duration-200 group">
                  <Link
                    href={`/dashboard/notes/${note.id}`}
                    className="block p-4 card-press"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {note.pinned && (
                            <span className="text-xs font-medium transition-colors duration-250" style={{ color: 'var(--accent-primary)' }}>📌</span>
                          )}
                          <h3 className="text-lg font-bold truncate transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                            {note.title || 'Untitled Note'}
                          </h3>
                        </div>
                        <p className="text-sm line-clamp-2 mb-2 transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                          {getPreview(note.body)}
                        </p>
                        <p className="text-[10px] transition-colors duration-250" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                  {/* Action buttons outside Link to prevent navigation on click */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePin(note.id, e)
                      }}
                      className="p-1.5 rounded-md transition-colors duration-250 shadow-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      {note.pinned ? '📌' : '📍'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteNote(note.id, e)
                      }}
                      className="p-1.5 rounded-md transition-colors duration-250 shadow-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'
                        e.currentTarget.style.color = 'var(--error)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Floating Action Button for quick note creation */}
      <button
        onClick={handleCreateNote}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        style={{ backgroundColor: 'var(--accent-primary)' }}
        title="New Note (⌘N)"
        aria-label="Create new note"
      >
        <Plus className="w-6 h-6" strokeWidth={2} />
      </button>
    </div>
  )
}
