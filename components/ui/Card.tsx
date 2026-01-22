/**
 * Card Component
 * 
 * Reusable card container with consistent styling.
 */

import { memo } from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'default' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

const Card = memo(function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  const baseClasses = 'glass-card rounded-lg transition-all duration-200'
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    default: 'p-5', // Most common padding used throughout app
    lg: 'p-6'
  }
  
  const interactiveClasses = onClick || hoverable
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98]'
    : ''
  
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component
      className={`${baseClasses} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  )
})

export default Card
