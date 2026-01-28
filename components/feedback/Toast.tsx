'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 3000) // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const getIconStyle = () => {
    switch (toast.type) {
      case 'success':
        return { color: 'var(--success)' }
      case 'error':
        return { color: 'var(--error)' }
      case 'info':
        return { color: 'var(--accent-primary)' }
    }
  }

  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--glass-border)',
      transition: 'all 250ms ease',
    }
    switch (toast.type) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          borderColor: 'rgba(74, 222, 128, 0.3)',
        }
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          borderColor: 'rgba(248, 113, 113, 0.3)',
        }
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
        }
    }
  }

  const getTextStyle = () => {
    switch (toast.type) {
      case 'success':
        return { color: 'var(--success)' }
      case 'error':
        return { color: 'var(--error)' }
      case 'info':
        return { color: 'var(--accent-primary)' }
    }
  }

  return (
    <div
      className="rounded-lg px-4 py-3 shadow-soft-lg flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slideUp"
      style={{
        ...getContainerStyle(),
        animation: 'slideUp 200ms ease-out',
      }}
    >
      <div className="flex-shrink-0">
        {toast.type === 'success' && (
          <CheckCircle2 className="w-5 h-5" style={getIconStyle()} strokeWidth={2} />
        )}
        {toast.type === 'error' && (
          <XCircle className="w-5 h-5" style={getIconStyle()} strokeWidth={2} />
        )}
        {toast.type === 'info' && (
          <AlertCircle className="w-5 h-5" style={getIconStyle()} strokeWidth={2} />
        )}
      </div>
      <p className="flex-1 text-sm font-medium" style={getTextStyle()}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 transition-colors duration-250"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        type="button"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
