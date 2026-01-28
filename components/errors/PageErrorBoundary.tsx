'use client'
import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
  pageName?: string
}

export function PageErrorBoundary({ children, pageName }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4" style={{ color: 'var(--error)' }}>
              💥
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Page Error
            </h1>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {pageName ? `The ${pageName} page` : 'This page'} encountered an error
            </p>
            <div className="space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded transition-colors duration-250"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Reload
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 rounded transition-colors duration-250"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        logger.error(`Page error in ${pageName || 'unknown page'}`, error, { componentStack: errorInfo.componentStack })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
