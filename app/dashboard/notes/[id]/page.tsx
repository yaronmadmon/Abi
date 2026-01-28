'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Share2, MoreVertical, Check, Type, List, Table, Paperclip, PenTool, Sparkles, Undo2, Redo2 } from 'lucide-react'
import { showToast } from '@/components/feedback/ToastContainer'
import { logger } from '@/lib/logger'

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export default function NoteEditorPage(): JSX.Element {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showAIMenu, setShowAIMenu] = useState(false)
  const [isAIPolishing, setIsAIPolishing] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)
  const [showDrawingModal, setShowDrawingModal] = useState(false)
  
  const titleRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadNote()
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  // Initialize contentEditable elements with note content on load
  useEffect(() => {
    if (note) {
      // Small delay to ensure refs are attached
      const timer = setTimeout(() => {
        if (titleRef.current && titleRef.current.textContent !== title) {
          titleRef.current.textContent = title || ''
        }
        if (bodyRef.current && bodyRef.current.innerHTML !== body) {
          bodyRef.current.innerHTML = body || ''
        }
      }, 50)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]) // Only when note ID changes (initial load)

  const loadNote = () => {
    try {
      const stored = localStorage.getItem('notes')
      if (stored) {
        const notes: Note[] = JSON.parse(stored)
        const found = notes.find(n => n.id === noteId)
        
        if (found) {
          setNote(found)
          setTitle(found.title || '')
          setBody(found.body || '')
        } else {
          // Note not found, redirect to notes list
          router.push('/dashboard/notes')
        }
      } else {
        router.push('/dashboard/notes')
      }
    } catch (error) {
      logger.error('Error loading note', error as Error)
      router.push('/dashboard/notes')
    }
  }

  const saveNote = useCallback(async (showConfirmation = false) => {
    if (!note) return
    
    try {
      setIsSaving(true)
      
      // Get current content from contentEditable elements
      const currentTitle = titleRef.current?.textContent || title || ''
      const currentBody = bodyRef.current?.innerHTML || body || ''
      
      const stored = localStorage.getItem('notes') || '[]'
      const notes: Note[] = JSON.parse(stored)
      
      const updatedNote: Note = {
        ...note,
        title: currentTitle.trim() || '',
        body: currentBody.trim(),
        updatedAt: new Date().toISOString(),
      }
      
      // Sync state
      setTitle(currentTitle.trim())
      setBody(currentBody.trim())
      
      const updated = notes.map(n => n.id === noteId ? updatedNote : n)
      localStorage.setItem('notes', JSON.stringify(updated))
      
      // Trigger update event
      window.dispatchEvent(new Event('notesUpdated'))
      
      setNote(updatedNote)
      setLastSaved(new Date())
      
      if (showConfirmation) {
        showToast('Saved! ✓', 'success')
      }
    } catch (error) {
      logger.error('Error saving note', error as Error)
      if (showConfirmation) {
        showToast('Couldn\'t save that. Try again?', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }, [note, noteId, title, body])

  useEffect(() => {
    // Auto-save on change (debounced)
    if (note) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(false) // Silent auto-save
      }, 1000) // 1 second debounce
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, body, note, saveNote])

  const handleBack = () => {
    // Save before leaving
    saveNote(false)
    router.push('/dashboard/notes')
  }

  const handleDone = () => {
    saveNote(true)
    router.push('/dashboard/notes')
  }

  const handleTitleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || ''
    setTitle(newTitle)
    // Update note state for auto-save
    if (note) {
      setNote({ ...note, title: newTitle })
    }
  }

  const handleBodyChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newBody = e.currentTarget.textContent || ''
    setBody(newBody)
    // Update note state for auto-save
    if (note) {
      setNote({ ...note, body: newBody })
    }
  }

  const handleAIAction = async (action: string) => {
    if (!note || isAIPolishing) return
    
    const selection = window.getSelection()
    const hasSelection = selection && selection.toString().trim()
    
    // AI ONLY works on selected text - no fallback to full note
    if (!hasSelection) {
      showToast('Select text to enhance', 'info')
      return
    }
    
    const textToProcess = selection.toString().trim()
    
    if (!textToProcess) {
      showToast('Select text to enhance', 'info')
      return
    }
    
    setIsAIPolishing(true)
    setShowAIMenu(false)
    
    try {
      let style: string = 'polish'
      switch (action) {
        case 'rewrite':
        case 'polish':
          style = 'polish'
          break
        case 'clearer':
          style = 'clarify'
          break
        case 'summarize':
          style = 'shorten'
          break
        case 'grammar':
          style = 'polish'
          break
        case 'professional':
          style = 'professional'
          break
        case 'friendly':
          style = 'friendlier'
          break
        case 'short':
          style = 'shorten'
          break
        default:
          style = 'polish'
      }
      
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, style }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to process text')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.polished && selection) {
        // Replace selected text in place
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const textNode = document.createTextNode(data.polished)
        range.insertNode(textNode)
        // Move cursor to end of inserted text
        selection.removeAllRanges()
        const newRange = document.createRange()
        newRange.setStartAfter(textNode)
        newRange.setEndAfter(textNode)
        selection.addRange(newRange)
        
        // Trigger change event for auto-save
        if (bodyRef.current) {
          const event = new Event('input', { bubbles: true })
          bodyRef.current.dispatchEvent(event)
        }
        
        showToast('Text updated', 'success')
      }
    } catch (error) {
      logger.error('AI action error', error as Error)
      showToast('Couldn\'t process that. Try again?', 'error')
    } finally {
      setIsAIPolishing(false)
    }
  }

  const handleInsertChecklist = () => {
    if (bodyRef.current) {
      const selection = window.getSelection()
      const range = selection && selection.rangeCount > 0 
        ? selection.getRangeAt(0)
        : (() => {
            const r = document.createRange()
            r.selectNodeContents(bodyRef.current)
            r.collapse(false)
            return r
          })()
      
      // Insert checkbox with proper formatting
      const checkbox = document.createElement('span')
      checkbox.textContent = '☐ '
      checkbox.style.fontSize = '1em'
      checkbox.contentEditable = 'false'
      checkbox.className = 'checklist-item'
      
      // Make checkbox clickable to toggle
      checkbox.addEventListener('click', (e) => {
        e.preventDefault()
        if (checkbox.textContent === '☐ ') {
          checkbox.textContent = '☑ '
        } else {
          checkbox.textContent = '☐ '
        }
      })
      
      range.insertNode(checkbox)
      range.setStartAfter(checkbox)
      range.collapse(true)
      
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      
      bodyRef.current.focus()
      
      // Trigger change for auto-save
      const event = new Event('input', { bubbles: true })
      bodyRef.current.dispatchEvent(event)
    }
  }

  const handleFormat = (format: 'bold' | 'italic' | 'underline' | 'heading') => {
    if (format === 'heading') {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const selectedText = selection.toString()
        if (selectedText) {
          const heading = document.createElement('strong')
          heading.style.fontSize = '1.2em'
          heading.textContent = selectedText
          range.deleteContents()
          range.insertNode(heading)
        }
      }
    } else {
      document.execCommand(format, false)
    }
    
    bodyRef.current?.focus()
    setShowFormatMenu(false)
    
    // Trigger change for auto-save
    if (bodyRef.current) {
      const event = new Event('input', { bubbles: true })
      bodyRef.current.dispatchEvent(event)
    }
  }

  const handleInsertTable = () => {
    if (bodyRef.current) {
      const selection = window.getSelection()
      const range = selection && selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : (() => {
            const r = document.createRange()
            r.selectNodeContents(bodyRef.current)
            r.collapse(false)
            return r
          })()
      
      // Create a simple 2x2 table
      const table = document.createElement('table')
      table.style.borderCollapse = 'collapse'
      table.style.width = '100%'
      table.style.margin = '10px 0'
      table.style.border = '1px solid #ddd'
      
      for (let i = 0; i < 2; i++) {
        const row = document.createElement('tr')
        for (let j = 0; j < 2; j++) {
          const cell = document.createElement('td')
          cell.style.border = '1px solid #ddd'
          cell.style.padding = '8px'
          cell.style.minWidth = '100px'
          cell.contentEditable = 'true'
          cell.textContent = ''
          row.appendChild(cell)
        }
        table.appendChild(row)
      }
      
      // Insert table
      range.insertNode(table)
      
      // Focus first cell
      const firstCell = table.querySelector('td') as HTMLTableCellElement
      if (firstCell) {
        const newRange = document.createRange()
        newRange.selectNodeContents(firstCell)
        newRange.collapse(true)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
        firstCell.focus()
      }
      
      bodyRef.current.focus()
      
      // Trigger change for auto-save
      const event = new Event('input', { bubbles: true })
      bodyRef.current.dispatchEvent(event)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        if (bodyRef.current && imageUrl) {
          const selection = window.getSelection()
          const range = selection && selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : (() => {
                const r = document.createRange()
                r.selectNodeContents(bodyRef.current)
                r.collapse(false)
                return r
              })()
          
          const img = document.createElement('img')
          img.src = imageUrl
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.display = 'block'
          img.style.margin = '10px 0'
          img.contentEditable = 'false'
          
          // Insert line break before image
          const br = document.createElement('br')
          range.insertNode(br)
          range.setStartAfter(br)
          
          // Insert image
          range.insertNode(img)
          
          // Insert line break after image
          const brAfter = document.createElement('br')
          range.setStartAfter(img)
          range.insertNode(brAfter)
          range.setStartAfter(brAfter)
          range.collapse(true)
          
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          
          bodyRef.current.focus()
          
          // Trigger change for auto-save
          const event = new Event('input', { bubbles: true })
          bodyRef.current.dispatchEvent(event)
          
          showToast('Image inserted', 'success')
        }
      }
      reader.readAsDataURL(file)
    } else {
      showToast('Only images are supported for now', 'info')
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin transition-colors duration-250" style={{ borderColor: 'var(--glass-border)', borderTopColor: 'var(--accent-primary)' }}></div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ 
        backgroundColor: 'var(--background)',
        top: '60px', // Account for header
        bottom: '64px', // Account for bottom nav (h-16)
      }}
    >
      {/* Page Container - Centered with padding like other dashboard pages */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full min-h-0">
          
          {/* Header - Fixed at top, outside card */}
          <div className="flex-shrink-0 mb-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 transition-colors duration-250 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span>Back</span>
              </button>
              
              <div className="flex items-center gap-2">
                {lastSaved && !isSaving && (
                  <span className="text-xs hidden sm:inline transition-colors duration-250" style={{ color: 'var(--text-muted)' }}>
                    Saved {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
                {isSaving && (
                  <div className="flex items-center gap-2 text-xs transition-colors duration-250" style={{ color: 'var(--text-muted)' }}>
                    <div className="w-3 h-3 border-2 rounded-full animate-spin transition-colors duration-250" style={{ borderColor: 'var(--glass-border)', borderTopColor: 'var(--accent-primary)' }}></div>
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    // Save before sharing
                    await saveNote(false)
                    
                    // Use native share API if available (mobile/modern browsers)
                    if (navigator.share && note) {
                      try {
                        await navigator.share({
                          title: note.title || 'Untitled Note',
                          text: note.body || '',
                        })
                        showToast('Note shared', 'success')
                      } catch (err) {
                        // User cancelled or error occurred
                        if (err instanceof Error && err.name !== 'AbortError') {
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(`${note.title || 'Untitled Note'}\n\n${note.body || ''}`)
                          showToast('Note copied to clipboard', 'success')
                        }
                      }
                    } else if (note) {
                      // Fallback for browsers without share API
                      const noteText = `${note.title || 'Untitled Note'}\n\n${note.body || ''}`
                      navigator.clipboard.writeText(noteText)
                      showToast('Note copied to clipboard', 'success')
                    }
                  }}
                  className="p-2 rounded-lg transition-colors duration-250"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={async () => {
                    // Save before any action
                    await saveNote(true)
                  }}
                  className="p-2 rounded-lg transition-colors duration-250"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  aria-label="Save"
                  title="Save note"
                >
                  <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleDone}
                  className="px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors duration-250"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  aria-label="Done"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes Card - Glass card matching other dashboard cards */}
          <div className="flex-1 flex flex-col overflow-hidden glass-card rounded-2xl relative" style={{ padding: 0 }}>
            {/* Editor Content - Scrollable area (ONLY scrollbar, inside card) */}
            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Title - First line, large font */}
              <div
                ref={titleRef}
                contentEditable
                onInput={handleTitleChange}
                suppressContentEditableWarning
                className="text-2xl md:text-3xl font-semibold mb-4 focus:outline-none min-h-[2rem] relative transition-colors duration-250"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: 'var(--text-primary)',
                }}
                data-placeholder="Title"
              />
              
              {/* Body - Free-flowing text */}
              <div
                ref={bodyRef}
                contentEditable
                onInput={handleBodyChange}
                suppressContentEditableWarning
                className="text-base leading-relaxed focus:outline-none min-h-[400px] relative transition-colors duration-250"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: 'var(--text-primary)',
                }}
                data-placeholder="Start writing..."
              />
            </div>

            {/* Bottom Toolbar - Fixed within card, always visible */}
            <div 
              className="flex-shrink-0 px-6 py-3 transition-colors duration-250"
              style={{ 
                backgroundColor: 'var(--card-bg-solid)',
                borderTop: '1px solid var(--glass-border)',
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem',
              }}
            >
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              {/* Undo */}
              <button
                onClick={() => {
                  document.execCommand('undo', false)
                  bodyRef.current?.focus()
                }}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="Undo"
              >
                <Undo2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              {/* Text Formatting - Aa Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  title="Text formatting"
                >
                  <span className="text-xs font-semibold">Aa</span>
                </button>
                
                {showFormatMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowFormatMenu(false)}
                    />
                    <div className="absolute bottom-full mb-2 left-0 z-50 glass-card rounded-xl shadow-lg py-1 min-w-[140px] transition-colors duration-250" style={{ border: '1px solid var(--glass-border)' }}>
                      <button
                        onClick={() => handleFormat('bold')}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-250 flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span className="font-bold">B</span>
                        <span>Bold</span>
                      </button>
                      <button
                        onClick={() => handleFormat('italic')}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-250 flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span className="italic">I</span>
                        <span>Italic</span>
                      </button>
                      <button
                        onClick={() => handleFormat('underline')}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-250 flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span className="underline">U</span>
                        <span>Underline</span>
                      </button>
                      <div className="my-1 transition-colors duration-250" style={{ borderTop: '1px solid var(--glass-border)' }}></div>
                      <button
                        onClick={() => handleFormat('heading')}
                        className="w-full text-left px-4 py-2 text-sm transition-colors duration-250"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        📝 Heading
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Checklist */}
              <button
                onClick={handleInsertChecklist}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="Checklist"
              >
                <List className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              {/* Table */}
              <button
                onClick={handleInsertTable}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="Table"
              >
                <Table className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              {/* Attachment */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  title="Attachment"
                >
                  <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              
              {/* Drawing / Markup */}
              <button
                onClick={() => setShowDrawingModal(true)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors duration-250 flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="Drawing"
              >
                <PenTool className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              {/* AI Pen */}
              <div className="relative">
                <button
                  onClick={() => setShowAIMenu(!showAIMenu)}
                  disabled={isAIPolishing || (!title.trim() && !body.trim())}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-lg transition-colors flex items-center justify-center ${
                    isAIPolishing
                      ? 'text-blue-500 bg-blue-50'
                      : (!title.trim() && !body.trim())
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  title="Abby AI assistance"
                >
                  {isAIPolishing ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
                
                {/* AI Menu */}
                {showAIMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowAIMenu(false)}
                    />
                    <div className="absolute bottom-full mb-2 right-0 z-50 glass-card rounded-xl shadow-lg border border-gray-200 py-1 min-w-[180px]">
                      <button
                        onClick={() => handleAIAction('rewrite')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ✨ Rewrite / Polish
                      </button>
                      <button
                        onClick={() => handleAIAction('clearer')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        💡 Make clearer
                      </button>
                      <button
                        onClick={() => handleAIAction('summarize')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📝 Summarize
                      </button>
                      <button
                        onClick={() => handleAIAction('grammar')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ✓ Fix grammar
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => handleAIAction('professional')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        💼 Professional tone
                      </button>
                      <button
                        onClick={() => handleAIAction('friendly')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        😊 Friendly tone
                      </button>
                      <button
                        onClick={() => handleAIAction('short')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ✂️ Make shorter
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Drawing Modal */}
      {showDrawingModal && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDrawingModal(false)}
          >
            <div 
              className="glass-card p-6 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Drawing</h3>
              <p className="text-sm text-gray-600 mb-4">Drawing feature coming soon. This will allow you to create sketches and markups directly in your notes.</p>
              <button
                onClick={() => setShowDrawingModal(false)}
                className="btn-primary w-full"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
