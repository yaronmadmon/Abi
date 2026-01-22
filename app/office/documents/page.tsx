'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Upload, FileText, Trash2, Download, Share2, Eye } from 'lucide-react'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentViewer from '@/components/documents/DocumentViewer'
import ShareDialog from '@/components/documents/ShareDialog'
import { showToast } from '@/components/feedback/ToastContainer'

interface Document {
  id: string
  title: string
  description?: string
  fileName: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [sharingDocument, setSharingDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = () => {
    const stored = localStorage.getItem('documents')
    if (stored) {
      setDocuments(JSON.parse(stored))
    }
  }

  const handleUpload = async (file: File, title: string, description?: string) => {
    // Convert file to base64 data URL for persistent storage
    const fileUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    
    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      fileName: file.name,
      fileSize: file.size,
      fileUrl, // Now a data URL that persists
      uploadedAt: new Date().toISOString(),
    }

    const updated = [...documents, newDocument]
    setDocuments(updated)
    localStorage.setItem('documents', JSON.stringify(updated))
    setShowUpload(false)
  }

  const handleDelete = (id: string) => {
    const updated = documents.filter(doc => doc.id !== id)
    setDocuments(updated)
    localStorage.setItem('documents', JSON.stringify(updated))
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    
    // Handle both data URLs and blob URLs
    if (doc.fileUrl.startsWith('data:')) {
      // Data URL - use directly
      link.href = doc.fileUrl
    } else if (doc.fileUrl.startsWith('blob:')) {
      // Blob URL - might be expired, try to convert
      link.href = doc.fileUrl
    } else {
      // Fallback
      link.href = doc.fileUrl
    }
    
    link.download = doc.fileName
    link.click()
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/office" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Office
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
            <p className="text-sm text-gray-500">Important files</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">Upload</span>
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-2">No documents yet</p>
            <p className="text-sm text-gray-400 mb-6">Upload your first document to get started</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-5 h-5" strokeWidth={2} />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="glass-card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{doc.fileName}</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingDocument(doc)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setSharingDocument(doc)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
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
        )}

        {showUpload && (
          <DocumentUpload
            isOpen={showUpload}
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
          />
        )}

        {viewingDocument && (
          <DocumentViewer
            isOpen={!!viewingDocument}
            onClose={() => setViewingDocument(null)}
            fileUrl={viewingDocument.fileUrl}
            fileName={viewingDocument.fileName}
            title={viewingDocument.title}
            onShare={() => {
              setViewingDocument(null)
              setSharingDocument(viewingDocument)
            }}
          />
        )}

        {sharingDocument && (
          <ShareDialog
            isOpen={!!sharingDocument}
            onClose={() => setSharingDocument(null)}
            fileUrl={sharingDocument.fileUrl}
            fileName={sharingDocument.fileName}
            title={sharingDocument.title}
          />
        )}
      </div>
    </div>
  )
}
