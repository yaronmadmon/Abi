'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { logger } from '@/lib/logger'
import { X, Download, Share2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  title: string
  onShare?: () => void
}

export default function DocumentViewer({ isOpen, onClose, fileUrl, fileName, title, onShare }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fileType, setFileType] = useState<string>('')
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (fileUrl) {
      const extension = fileName.split('.').pop()?.toLowerCase() || ''
      setFileType(extension)
      setImageError(false)
      setIsLoading(true)
    }
  }, [fileUrl, fileName])

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    
    // Handle both data URLs and blob URLs
    if (fileUrl.startsWith('data:')) {
      // Data URL - use directly
      link.href = fileUrl
    } else if (fileUrl.startsWith('blob:')) {
      // Blob URL - might be expired, try anyway
      link.href = fileUrl
    } else {
      link.href = fileUrl
    }
    
    link.download = fileName
    link.click()
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)
  const isPDF = fileType === 'pdf'

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold truncate">{title}</h2>
          <p className="text-sm text-gray-400 truncate">{fileName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-5 h-5" strokeWidth={2} />
              </button>
            </>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isImage ? (
          <>
            {isLoading && !imageError && (
              <div className="text-white text-center">
                <p>Loading image...</p>
              </div>
            )}
            {imageError ? (
              <div className="text-center text-white">
                <p className="mb-4">Failed to load image. The file may be corrupted or the URL is invalid.</p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" strokeWidth={2} />
                  <span>Download to view</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={fileUrl}
                  alt={title}
                  fill
                  className="object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    logger.error('Image load error', new Error('Failed to load image'))
                    setImageError(true)
                    setIsLoading(false)
                  }}
                  unoptimized
                />
              </div>
            )}
          </>
        ) : isPDF ? (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            style={{ minHeight: '600px' }}
            title={title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.error('PDF load error:', fileUrl.substring(0, 50) + '...')
              setImageError(true)
              setIsLoading(false)
            }}
          />
        ) : (
          <div className="text-center text-white">
            <p className="mb-4">Preview not available for this file type</p>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" strokeWidth={2} />
              <span>Download to view</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
