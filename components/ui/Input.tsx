/**
 * Input Component
 * 
 * Reusable input field with consistent styling.
 */

import { memo, forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(function Input(
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) {
    const baseClasses = 'px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2'
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800'
    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${widthClass} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  })
)

export default Input
