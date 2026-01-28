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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing, command.id])
  
  return (
    <div 
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'rgba(139, 158, 255, 0.1)',
        border: '1px solid rgba(139, 158, 255, 0.2)'
      }}
    >
      {/* Title */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{summary.title}</h4>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{summary.description}</p>
      </div>
      
      {/* Impacts */}
      {summary.impacts.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Details:</p>
          <ul className="text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            {summary.impacts.map((impact, index) => (
              <li key={index} className="flex items-center gap-1">
                <span style={{ color: 'var(--accent-primary)' }}>•</span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Risks */}
      {risks && risks.length > 0 && (
        <div 
          className="mb-3 rounded-lg p-2"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} strokeWidth={2} />
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--warning)' }}>Warning:</p>
              <ul className="text-xs space-y-0.5" style={{ color: 'var(--warning)', opacity: 0.8 }}>
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: 'var(--accent-primary)',
            boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
          }}
          title="Press Enter to confirm"
        >
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          <span>{isProcessing ? 'Processing...' : 'Confirm'}</span>
          <kbd 
            className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >↵</kbd>
        </button>
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-white/10 active:scale-[0.98]"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)'
          }}
          title="Press Esc to cancel"
        >
          <XCircle className="w-4 h-4" strokeWidth={2} />
          <span>Cancel</span>
          <kbd 
            className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >Esc</kbd>
        </button>
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="mt-2 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tip: Press <kbd className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Enter</kbd> to confirm or <kbd className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Esc</kbd> to cancel
        </p>
      </div>
    </div>
  )
}
