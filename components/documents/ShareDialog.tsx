'use client'

import { useState, useEffect } from 'react'
import { X, Mail, MessageCircle, Link2, Copy, Check } from 'lucide-react'
import { showToast } from '@/components/feedback/ToastContainer'
import AppModal from '../modals/AppModal'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  title: string
}

export default function ShareDialog({ isOpen, onClose, fileUrl, fileName, title }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Initialize share link on mount
  useEffect(() => {
    if (isOpen && !shareLink) {
      const link = fileUrl
      setShareLink(link)
    }
  }, [isOpen, fileUrl, shareLink])

  // Generate shareable link (in production, this would be a server-generated link)
  const generateShareLink = () => {
    // For now, create a data URL or blob URL
    // In production, you'd upload to a server and get a shareable link
    // For blob URLs, we can't share them directly, so we'll create a shareable format
    let link = fileUrl
    
    // If it's a blob URL, we need to handle it differently
    // For now, we'll use the blob URL but note that it's only valid in the current session
    if (fileUrl.startsWith('blob:')) {
      // In a real app, you'd upload to a server and get a permanent link
      // For now, we'll use the blob URL with a note
      link = fileUrl
    }
    
    setShareLink(link)
    return link
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLinkCopied(true)
      showToast('Link copied', 'success')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      showToast('Couldn\'t copy link', 'error')
    }
  }

  const handleEmailShare = () => {
    try {
      const subject = encodeURIComponent(`Shared document: ${title}`)
      const body = encodeURIComponent(`I'm sharing this document with you: ${title}\n\nView it here: ${shareLink || generateShareLink()}`)
      window.location.href = `mailto:${emailAddress || ''}?subject=${subject}&body=${body}`
      showToast('Opening email app', 'info')
      onClose()
    } catch (error) {
      showToast('Couldn\'t open email', 'error')
    }
  }

  const handleWhatsAppShare = () => {
    try {
      const text = encodeURIComponent(`Check out this document: ${title}\n${shareLink || generateShareLink()}`)
      window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${text}`, '_blank')
      showToast('Opening WhatsApp', 'info')
      onClose()
    } catch (error) {
      showToast('Couldn\'t open WhatsApp', 'error')
    }
  }

  const handleSMSShare = () => {
    try {
      const text = encodeURIComponent(`Check out this document: ${title}\n${shareLink || generateShareLink()}`)
      window.location.href = `sms:${phoneNumber.replace(/\D/g, '')}?body=${text}`
      showToast('Opening messages app', 'info')
      onClose()
    } catch (error) {
      showToast('Couldn\'t open messages', 'error')
    }
  }

  const handleCopyLink = () => {
    const link = shareLink || generateShareLink()
    copyToClipboard(link)
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} variant="center" className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="modal-title" className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Share Document</h2>
        <button
          onClick={onClose}
          className="transition-colors duration-250"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

        <div className="space-y-4">
          {/* Email Share */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Share via Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                style={{ 
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
              <button
                onClick={handleEmailShare}
                disabled={!emailAddress}
                className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-250 flex items-center gap-2"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'
                }}
              >
                <Mail className="w-4 h-4" strokeWidth={2} />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Share */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Share via WhatsApp
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                style={{ 
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
              <button
                onClick={handleWhatsAppShare}
                disabled={!phoneNumber}
                className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-250 flex items-center gap-2"
                style={{ backgroundColor: '#10b981', color: 'white' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'
                }}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* SMS Share */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Share via SMS/Text
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                style={{ 
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
              <button
                onClick={handleSMSShare}
                disabled={!phoneNumber}
                className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-250 flex items-center gap-2"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'
                }}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Copy Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink || generateShareLink()}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg text-sm transition-colors duration-250"
                style={{ 
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)'
                }}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-lg transition-colors duration-250 flex items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Share API (if available) */}
          {navigator.share && (
            <button
              onClick={async () => {
                try {
                  const link = shareLink || generateShareLink()
                  await navigator.share({
                    title: title,
                    text: `Check out this document: ${title}`,
                    url: link,
                  })
                } catch (err) {
                  console.error('Share failed:', err)
                }
              }}
              className="w-full px-4 py-3 rounded-lg transition-colors duration-250 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Link2 className="w-4 h-4" strokeWidth={2} />
              <span>Share via System</span>
            </button>
          )}
        </div>
    </AppModal>
  )
}
