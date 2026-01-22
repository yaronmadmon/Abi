'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, FileText, Trash2, Download, Send, Phone, Eye } from 'lucide-react'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'

interface Fax {
  id: string
  type: 'sent' | 'received'
  title: string
  description?: string
  fileName: string
  fileSize: number
  fileUrl: string
  faxNumber: string
  sentAt?: string
  receivedAt?: string
  status?: 'sending' | 'sent' | 'failed' | 'received'
}

export default function FaxPage() {
  const [faxes, setFaxes] = useState<Fax[]>([])
  const [showSendFax, setShowSendFax] = useState(false)
  const [viewingFax, setViewingFax] = useState<Fax | null>(null)
  const [faxNumber, setFaxNumber] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMeta, setSelectedMeta] = useState<{ title: string; description?: string } | null>(null)
  const [selectedFileObjectUrl, setSelectedFileObjectUrl] = useState<string | null>(null)
  const [viewingPending, setViewingPending] = useState<{
    fileUrl: string
    fileName: string
    title: string
  } | null>(null)

  useEffect(() => {
    loadFaxes()
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'faxes') {
        loadFaxes()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Maintain a stable object URL for pending file preview/download.
  useEffect(() => {
    if (!selectedFile) {
      if (selectedFileObjectUrl) {
        URL.revokeObjectURL(selectedFileObjectUrl)
      }
      setSelectedFileObjectUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setSelectedFileObjectUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  const loadFaxes = () => {
    try {
      const stored = localStorage.getItem('faxes')
      if (!stored) {
        setFaxes([])
        return
      }
      const allFaxes: Fax[] = JSON.parse(stored)
      setFaxes(Array.isArray(allFaxes) ? allFaxes : [])
    } catch (error) {
      console.error('Failed to load faxes:', error)
      setFaxes([])
    }
  }

  const handleFileSelect = (file: File, title: string, description?: string) => {
    setSelectedFile(file)
    setSelectedMeta({
      title: title?.trim() || file.name.replace(/\.[^/.]+$/, ''),
      description: description?.trim() || undefined,
    })
    setShowSendFax(true)
    // DocumentUpload's onUpload is called after file is selected and form submitted
    // This will now show the fax number input form
  }

  const clearPendingAttachment = () => {
    setSelectedFile(null)
    setSelectedMeta(null)
    setFaxNumber('')
    setViewingPending(null)
  }

  const handleSendFax = async (faxNumber: string) => {
    if (!selectedFile) {
      showToast('Please select a document to fax', 'error')
      return
    }

    if (!faxNumber.trim()) {
      showToast('Please enter a fax number', 'error')
      return
    }

    try {
      // Convert file to base64 data URL
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      const fallbackTitle = selectedFile.name.replace(/\.[^/.]+$/, '')
      const newFax: Fax = {
        id: `fax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'sent',
        title: selectedMeta?.title || fallbackTitle,
        description: selectedMeta?.description,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileUrl,
        faxNumber: faxNumber.trim(),
        sentAt: new Date().toISOString(),
        status: 'sent',
      }

      // Save to localStorage
      const stored = localStorage.getItem('faxes')
      const faxes: Fax[] = stored ? JSON.parse(stored) : []
      faxes.unshift(newFax) // Add to beginning
      try {
        localStorage.setItem('faxes', JSON.stringify(faxes))
      } catch (e) {
        // Most common: quota exceeded (base64 is large)
        console.error('Failed to save fax to localStorage:', e)
        showToast('Could not save fax (storage full). Try a smaller file.', 'error')
        return
      }

      // Reload faxes
      loadFaxes()
      setShowSendFax(false)
      clearPendingAttachment()
      showToast('Fax sent successfully', 'success')
    } catch (error) {
      showToast('Couldn\'t send fax', 'error')
    }
  }

  const handleDelete = (id: string) => {
    try {
      const ok = window.confirm('Delete this fax and its attached document? This cannot be undone.')
      if (!ok) return

      const stored = localStorage.getItem('faxes')
      if (stored) {
        const allFaxes: Fax[] = JSON.parse(stored)
        const updated = allFaxes.filter(fax => fax.id !== id)
        localStorage.setItem('faxes', JSON.stringify(updated))
        loadFaxes()
        showToast('Fax deleted', 'success')
      }
    } catch (error) {
      showToast('Couldn\'t delete fax', 'error')
    }
  }

  const handleDownload = (fax: Fax) => {
    try {
      const link = document.createElement('a')
      // Handle both data URLs and blob URLs
      if (fax.fileUrl.startsWith('data:')) {
        link.href = fax.fileUrl
      } else if (fax.fileUrl.startsWith('blob:')) {
        link.href = fax.fileUrl
      } else {
        link.href = fax.fileUrl
      }
      link.download = fax.fileName
      link.click()
      showToast('Download started', 'success')
    } catch (error) {
      showToast('Couldn\'t download fax', 'error')
    }
  }

  const handleDownloadPending = () => {
    if (!selectedFile) return
    try {
      const link = document.createElement('a')
      const href = selectedFileObjectUrl || URL.createObjectURL(selectedFile)
      link.href = href
      link.download = selectedFile.name
      link.click()
      showToast('Download started', 'success')
    } catch (error) {
      showToast('Couldn\'t download attachment', 'error')
    }
  }

  const sentFaxes = faxes.filter(fax => fax.type === 'sent')
  const receivedFaxes = faxes.filter(fax => fax.type === 'received')

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/office" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Office
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fax</h1>
            <p className="text-sm text-gray-500">Send & receive faxes</p>
          </div>
          <button
            onClick={() => {
              clearPendingAttachment()
              setShowSendFax(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Camera className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">Send Fax</span>
          </button>
        </div>

        {/* Send Fax Dialog */}
        {showSendFax && !selectedFile && (
          <DocumentUpload
            onUpload={(file, title, description) => {
              handleFileSelect(file, title, description)
            }}
            onCancel={() => {
              setShowSendFax(false)
              clearPendingAttachment()
            }}
            autoStartCamera={false}
          />
        )}

        {showSendFax && selectedFile && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Fax</h2>
            <div className="space-y-4">
                <div className="glass-card p-4 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedMeta?.title || selectedFile.name}</p>
                      {selectedMeta?.description && (
                        <p className="text-sm text-gray-600 truncate">{selectedMeta.description}</p>
                      )}
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedFileObjectUrl) return
                          setViewingPending({
                            fileUrl: selectedFileObjectUrl,
                            fileName: selectedFile.name,
                            title: selectedMeta?.title || selectedFile.name.replace(/\.[^/.]+$/, ''),
                          })
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View / Preview"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPending}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const ok = window.confirm('Remove this attachment?')
                          if (!ok) return
                          clearPendingAttachment()
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fax Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
                    <input
                      type="tel"
                      value={faxNumber}
                      onChange={(e) => setFaxNumber(e.target.value)}
                      placeholder="Enter fax number (e.g., +1-555-123-4567)"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSendFax(faxNumber)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                    <span>Send Fax</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSendFax(false)
                      clearPendingAttachment()
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Sent Faxes */}
        {sentFaxes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Sent</h2>
            <div className="space-y-3">
              {sentFaxes.map((fax) => (
                <div key={fax.id} className="glass-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Send className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{fax.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {fax.faxNumber}
                        </span>
                        {fax.sentAt && (
                          <span>{new Date(fax.sentAt).toLocaleDateString()}</span>
                        )}
                        <span className="text-green-600 font-medium">{fax.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingFax(fax)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDownload(fax)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(fax.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Received Faxes */}
        {receivedFaxes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Received</h2>
            <div className="space-y-3">
              {receivedFaxes.map((fax) => (
                <div key={fax.id} className="glass-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{fax.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        {fax.receivedAt && (
                          <span>{new Date(fax.receivedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingFax(fax)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDownload(fax)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(fax.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {faxes.length === 0 && !showSendFax && (
          <div className="glass-card p-12 text-center">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-2">No faxes yet</p>
            <p className="text-sm text-gray-400 mb-6">Scan and send your first fax to get started</p>
            <button
              onClick={() => {
                clearPendingAttachment()
                setShowSendFax(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Camera className="w-5 h-5" strokeWidth={2} />
              <span>Send Fax</span>
            </button>
          </div>
        )}

        {/* Document Viewer */}
        {viewingFax && (
          <DocumentViewer
            isOpen={!!viewingFax}
            onClose={() => setViewingFax(null)}
            fileUrl={viewingFax.fileUrl}
            fileName={viewingFax.fileName}
            title={viewingFax.title}
          />
        )}

        {/* Pending Attachment Viewer (before sending) */}
        {viewingPending && (
          <DocumentViewer
            isOpen={!!viewingPending}
            onClose={() => setViewingPending(null)}
            fileUrl={viewingPending.fileUrl}
            fileName={viewingPending.fileName}
            title={viewingPending.title}
          />
        )}
      </PageContainer>
    </div>
  )
}
