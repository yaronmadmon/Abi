'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Camera, X, FileText, FileImage, FileType } from 'lucide-react'
import { jsPDF } from 'jspdf'
import AIPen from '../AIPen'
import AppModal from '../modals/AppModal'

interface DocumentUploadProps {
  isOpen?: boolean
  onUpload: (file: File, title: string, description?: string) => void
  onCancel: () => void
  autoStartCamera?: boolean
}

type SaveFormat = 'image' | 'pdf'

export default function DocumentUpload({ isOpen = true, onUpload, onCancel, autoStartCamera = false }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveFormat, setSaveFormat] = useState<SaveFormat>('image')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setError(null)
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit')
      return
    }

    setFile(selectedFile)
    if (!title) {
      // Auto-generate title from filename
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      setShowCamera(true)
      // Stream will be set via useEffect when video element is mounted
    } catch (err) {
      console.error('Error accessing camera:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Could not access camera: ${errorMessage}. Please check permissions or use file upload instead.`)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    if (saveFormat === 'image') {
      // Save as image (JPEG)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
          stopCamera()
          handleFileSelect(file)
        }
      }, 'image/jpeg', 0.9)
    } else {
      // Save as PDF
      try {
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm'
        })
        
        // Get PDF page dimensions in mm
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        
        // Convert canvas dimensions from pixels to mm (assuming 96 DPI)
        const mmPerPixel = 25.4 / 96
        const imgWidthMM = canvas.width * mmPerPixel
        const imgHeightMM = canvas.height * mmPerPixel
        
        // Calculate scaling to fit page
        const widthRatio = pdfWidth / imgWidthMM
        const heightRatio = pdfHeight / imgHeightMM
        const ratio = Math.min(widthRatio, heightRatio, 1) // Don't scale up
        
        const scaledWidth = imgWidthMM * ratio
        const scaledHeight = imgHeightMM * ratio
        
        // Center the image
        const xOffset = (pdfWidth - scaledWidth) / 2
        const yOffset = (pdfHeight - scaledHeight) / 2
        
        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight)
        
        // Convert PDF to blob
        const pdfBlob = pdf.output('blob')
        const file = new File([pdfBlob], `scan-${Date.now()}.pdf`, { type: 'application/pdf' })
        stopCamera()
        handleFileSelect(file)
      } catch (err) {
        console.error('Error creating PDF:', err)
        setError('Failed to create PDF. Saving as image instead.')
        // Fallback to image
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
            stopCamera()
            handleFileSelect(file)
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    onUpload(file, title.trim(), description.trim() || undefined)
    
    // Reset
    setFile(null)
    setTitle('')
    setDescription('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    stopCamera()
  }

  // Set video stream when camera is shown and video element is mounted
  useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [showCamera])

  // Auto-start camera if requested (for scanner mode)
  useEffect(() => {
    if (autoStartCamera && !showCamera && !file) {
      startCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartCamera])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <AppModal isOpen={isOpen} onClose={onCancel} variant="center" className="glass-card p-6 max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Upload Document</h2>
          <button
            onClick={onCancel}
            className="transition-colors duration-250"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm transition-colors duration-250" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {!file && !showCamera && (
          <div className="mb-4 space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-colors duration-250"
              style={{ 
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--glass-border)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              }}
            >
              <Upload className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Upload File</span>
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-colors duration-250"
              style={{ 
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--glass-border)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)'
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              }}
            >
              <Camera className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Scan with Camera</span>
            </button>
          </div>
        )}

        {showCamera && !file && (
          <div className="mb-4">
            {/* Format Selector */}
            <div className="mb-3 flex items-center gap-2 p-2 rounded-lg transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Save as:</span>
              <div className="flex gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setSaveFormat('image')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors duration-250"
                  style={saveFormat === 'image' 
                    ? { backgroundColor: 'var(--accent-primary)', color: 'white' }
                    : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }
                  }
                  onMouseEnter={(e) => {
                    if (saveFormat !== 'image') {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (saveFormat !== 'image') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                    }
                  }}
                >
                  <FileImage className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaveFormat('pdf')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors duration-250"
                  style={saveFormat === 'pdf' 
                    ? { backgroundColor: 'var(--accent-primary)', color: 'white' }
                    : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }
                  }
                  onMouseEnter={(e) => {
                    if (saveFormat !== 'pdf') {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (saveFormat !== 'pdf') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                    }
                  }}
                >
                  <FileType className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">PDF</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden mb-3 border-2 bg-black transition-colors duration-250" style={{ borderColor: 'var(--glass-border)' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
                style={{ maxHeight: '400px', objectFit: 'contain', display: 'block' }}
              />
              {/* Camera overlay frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-white/50 rounded-lg" style={{ width: '85%', height: '70%' }} />
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 px-4 py-3 rounded-lg transition-colors duration-250 font-medium"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Capture {saveFormat === 'pdf' ? 'as PDF' : 'Photo'}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 px-4 py-3 rounded-lg transition-colors duration-250"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
          className="hidden"
        />

        {file && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Preview */}
              {file.type.startsWith('image/') && (
                <div className="mb-4 relative w-full h-[400px]">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    fill
                    className="rounded-xl object-contain transition-colors duration-250"
                    style={{ border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                    unoptimized
                  />
                </div>
              )}
              {file.type === 'application/pdf' && (
                <div className="mb-4 p-4 rounded-xl transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                  <div className="flex items-center gap-3">
                    <FileType className="w-8 h-8" strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>PDF Document</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Preview available after saving</p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <FileText className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {file.type.startsWith('image/') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="p-2 transition-colors duration-250"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Remove image"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg transition-colors duration-250"
                    style={{ 
                      border: '1px solid var(--glass-border)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                    placeholder="Document title"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AIPen
                      text={title}
                      onPolished={(polished) => setTitle(polished)}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Description (optional)
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg transition-colors duration-250"
                    style={{ 
                      border: '1px solid var(--glass-border)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                    placeholder="Add a description..."
                    rows={3}
                  />
                  <div className="absolute right-2 top-2">
                    <AIPen
                      text={description}
                      onPolished={(polished) => setDescription(polished)}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 flex-shrink-0 transition-colors duration-250" style={{ borderTop: '1px solid var(--glass-border)' }}>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Upload
              </button>
            </div>
          </form>
        )}
    </AppModal>
  )
}
