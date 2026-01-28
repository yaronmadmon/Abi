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
    const baseClasses = 'px-3 py-2 rounded-xl transition-all duration-250 focus:outline-none focus:ring-2'
    const stateClasses = error
      ? 'focus:ring-red-500/30'
      : 'focus:ring-[#8B9EFF]/30'
    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${widthClass} ${className}`}
          style={{
            backgroundColor: 'var(--input-bg)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--input-border)'}`,
            color: 'var(--text-primary)'
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{helperText}</p>
        )}
      </div>
    )
  })
)

export default Input
