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

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2} />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" strokeWidth={2} />
    }
  }

  const getBgColor = () => {
    // Dark mode compatible colors
    const isDark = document.documentElement.classList.contains('dark-mode')
    switch (toast.type) {
      case 'success':
        return isDark ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'
      case 'error':
        return isDark ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'
      case 'info':
        return isDark ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    const isDark = document.documentElement.classList.contains('dark-mode')
    switch (toast.type) {
      case 'success':
        return isDark ? 'text-green-200' : 'text-green-800'
      case 'error':
        return isDark ? 'text-red-200' : 'text-red-800'
      case 'info':
        return isDark ? 'text-blue-200' : 'text-blue-800'
    }
  }

  return (
    <div
      className={`${getBgColor()} border rounded-lg px-4 py-3 shadow-soft-lg flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slideUp`}
      style={{ animation: 'slideUp 200ms ease-out' }}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className={`flex-1 text-sm font-medium ${getTextColor()}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        type="button"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
