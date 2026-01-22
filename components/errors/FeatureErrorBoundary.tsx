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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                {featureName || 'Feature'} Unavailable
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                This feature encountered an error and can't be displayed right now.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
