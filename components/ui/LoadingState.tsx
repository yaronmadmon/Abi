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
        className={`${spinnerSizes[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4`}
      />
      <p className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>
        {message}
      </p>
    </div>
  )
})

export default LoadingState
