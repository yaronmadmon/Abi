/**
 * Loading State Component
 * 
 * Shows while data is loading.
 */

import { memo } from 'react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const LoadingState = memo(function LoadingState({
  message = 'Loading...',
  size = 'md'
}: LoadingStateProps) {
  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div 
        className={`${spinnerSizes[size]} border-4 rounded-full animate-spin mb-4`}
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--accent-primary)'
        }}
      />
      <p 
        className={`${textSizes[size]}`}
        style={{ color: 'var(--text-secondary)' }}
      >
        {message}
      </p>
    </div>
  )
})

export default LoadingState
