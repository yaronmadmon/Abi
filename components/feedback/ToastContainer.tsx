'use client'

import { useState, useCallback, useEffect } from 'react'
import Toast, { type Toast as ToastType } from './Toast'

let toastIdCounter = 0
let toastListeners: Array<(toasts: ToastType[]) => void> = []
let currentToasts: ToastType[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...currentToasts]))
}

export const showToast = (message: string, type: ToastType['type'] = 'success') => {
  const id = `toast-${++toastIdCounter}-${Date.now()}`
  const newToast: ToastType = { id, message, type }
  currentToasts = [...currentToasts, newToast]
  notifyListeners()

  // Auto-remove after 3 seconds
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 3000)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  useEffect(() => {
    const listener = (newToasts: ToastType[]) => {
      setToasts(newToasts)
    }
    toastListeners.push(listener)
    setToasts([...currentToasts])

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const handleDismiss = useCallback((id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  )
}
