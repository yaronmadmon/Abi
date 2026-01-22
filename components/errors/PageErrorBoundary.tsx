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
            <div className="text-red-500 text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Page Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {pageName ? `The ${pageName} page` : 'This page'} encountered an error
            </p>
            <div className="space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Reload
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
