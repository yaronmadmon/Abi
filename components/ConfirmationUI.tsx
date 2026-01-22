'use client'

/**
 * Confirmation UI
 * Displays action proposals and collects user approval/rejection
 * 
 * ARCHITECTURAL GUARANTEE:
 * This component is the ONLY way to generate approval tokens.
 * No other code can approve commands and trigger execution.
 */

import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { ActionProposal } from '@/ai/schemas/commandSchema'

interface ConfirmationUIProps {
  proposal: ActionProposal
  onApprove: (commandId: string) => void
  onReject: (commandId: string) => void
  isProcessing?: boolean
}

export default function ConfirmationUI({ proposal, onApprove, onReject, isProcessing = false }: ConfirmationUIProps) {
  const { command, summary, preview, risks } = proposal
  
  const handleApprove = () => {
    onApprove(command.id)
  }
  
  const handleReject = () => {
    onReject(command.id)
  }
  
  // Keyboard shortcuts: Enter = approve, Esc = reject
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return
      
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleApprove()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleReject()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isProcessing, command.id])
  
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
      {/* Title */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{summary.title}</h4>
        <p className="text-sm text-gray-700">{summary.description}</p>
      </div>
      
      {/* Impacts */}
      {summary.impacts.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Details:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {summary.impacts.map((impact, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-blue-500">•</span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Risks */}
      {risks && risks.length > 0 && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-xs font-medium text-yellow-800 mb-1">Warning:</p>
              <ul className="text-xs text-yellow-700 space-y-0.5">
                {risks.map((risk, index) => (
                  <li key={index}>• {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Press Enter to confirm"
        >
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          <span>{isProcessing ? 'Processing...' : 'Confirm'}</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-blue-600 rounded">↵</kbd>
        </button>
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Press Esc to cancel"
        >
          <XCircle className="w-4 h-4" strokeWidth={2} />
          <span>Cancel</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-gray-300 rounded">Esc</kbd>
        </button>
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to confirm or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel</p>
      </div>
    </div>
  )
}
