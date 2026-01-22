'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  closeOnOverlayClick?: boolean
  variant?: 'center' | 'bottom' | 'fullscreen'
  className?: string
  style?: React.CSSProperties
}

export default function AppModal({
  isOpen,
  onClose,
  children,
  closeOnOverlayClick = true,
  variant = 'center',
  className = '',
  style,
}: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // Lock body scroll and add modal-open class for debug indicator
      document.body.style.overflow = 'hidden'
      if (document.body) {
        document.body.classList.add('modal-open')
      }
      
      // Focus trap: focus the modal container
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }
    } else {
      // Restore body scroll and remove modal-open class
      if (document.body) {
        document.body.style.overflow = ''
        document.body.classList.remove('modal-open')
      }
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      if (typeof window !== 'undefined' && document.body) {
        document.body.style.overflow = ''
        document.body.classList.remove('modal-open')
      }
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap: keep focus inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleTabKey)
    return () => window.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  if (!isOpen) return null

  // Determine panel classes based on variant
  const getPanelClasses = () => {
    const baseClasses = 'bg-white'
    
    if (variant === 'fullscreen') {
      // Full screen on mobile, constrained on desktop
      return `${baseClasses} w-full h-full sm:max-w-md sm:h-[90vh] sm:rounded-2xl`
    }
    
    if (variant === 'bottom') {
      // Full screen on mobile (h-full), constrained height on desktop
      return `${baseClasses} w-full h-full sm:h-auto sm:max-h-[90vh] rounded-t-3xl shadow-soft-lg flex flex-col`
    }
    
    // Center variant (default) - full screen on mobile, constrained on desktop
    return `${baseClasses} w-full h-full sm:max-w-md sm:h-[90vh] sm:rounded-2xl shadow-2xl`
  }

  // Determine overlay alignment based on variant
  const getOverlayClasses = () => {
    if (variant === 'bottom') {
      return 'fixed inset-0 z-[9999] bg-black/60 flex items-end justify-center'
    }
    return 'fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center'
  }

  const overlay = (
    <div
      className={getOverlayClasses()}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={`${getPanelClasses()} ${className}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {children}
      </div>
    </div>
  )

  // Render to document.body using portal
  if (typeof window !== 'undefined') {
    return createPortal(overlay, document.body)
  }

  return null
}
