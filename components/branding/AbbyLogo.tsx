/**
 * Abby Logo Component
 * 
 * Elegant script logo with "Abby" branding
 * Uses Allura font for elegant handwritten script style
 */

import { memo } from 'react'

interface AbbyLogoProps {
  size?: 'small' | 'default' | 'large'
  showSubtitle?: boolean
  className?: string
}

const AbbyLogo = memo(function AbbyLogo({
  size = 'default',
  showSubtitle = true,
  className = '',
}: AbbyLogoProps) {
  const sizeClasses = {
    small: 'text-2xl',
    default: 'text-3xl',
    large: 'text-4xl'
  }
  
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <h1 className={`logo-script ${sizeClasses[size]} leading-none`}>
        Abby
      </h1>
      {showSubtitle && (
        <p className="logo-subtitle">Your Home Assistant</p>
      )}
    </div>
  )
})

export default AbbyLogo
