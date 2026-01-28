/**
 * Badge Component
 * 
 * Small label for status, categories, counts, etc.
 */

import { memo } from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Badge = memo(function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full'
  
  const variantStyles = {
    default: { 
      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
      color: 'var(--text-secondary)' 
    },
    primary: { 
      backgroundColor: 'rgba(139, 158, 255, 0.2)', 
      color: '#8B9EFF' 
    },
    success: { 
      backgroundColor: 'rgba(74, 222, 128, 0.2)', 
      color: '#4ADE80' 
    },
    warning: { 
      backgroundColor: 'rgba(251, 191, 36, 0.2)', 
      color: '#FBBF24' 
    },
    danger: { 
      backgroundColor: 'rgba(248, 113, 113, 0.2)', 
      color: '#F87171' 
    },
    info: { 
      backgroundColor: 'rgba(139, 158, 255, 0.15)', 
      color: '#8B9EFF' 
    }
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }
  
  return (
    <span 
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
})

export default Badge
