/**
 * Button Component
 * 
 * Reusable button with consistent styling across the app.
 */

import { memo } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  isLoading?: boolean
  children: React.ReactNode
}

const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-full font-medium transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'text-white hover:shadow-lg active:scale-[0.98]',
    secondary: 'hover:shadow-md active:scale-[0.98]',
    danger: 'text-white hover:shadow-lg active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-white/5 active:scale-[0.98]'
  }
  
  const variantStyles = {
    primary: { 
      backgroundColor: 'var(--accent-primary)',
      boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
    },
    secondary: { 
      backgroundColor: 'var(--glass-bg)', 
      color: 'var(--text-primary)',
      border: '1px solid var(--glass-border)'
    },
    danger: { 
      backgroundColor: 'var(--error)',
      boxShadow: '0 4px 15px rgba(248, 113, 113, 0.3)'
    },
    ghost: {
      color: 'var(--text-primary)'
    }
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      style={variantStyles[variant]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
})

export default Button
