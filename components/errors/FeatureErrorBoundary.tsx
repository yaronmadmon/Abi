'use client'
import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
  featureName?: string
}

export function FeatureErrorBoundary({ children, featureName }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div
          className="p-4 rounded-lg transition-colors duration-250"
          style={{
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl" style={{ color: 'var(--error)' }}>
              ⚠️
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold mb-1"
                style={{ color: 'var(--error)' }}
              >
                {featureName || 'Feature'} Unavailable
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                This feature encountered an error and can't be displayed right now.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm px-3 py-1 rounded transition-colors duration-250"
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        logger.error(`Feature error in ${featureName || 'unknown feature'}`, error, { componentStack: errorInfo.componentStack })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
