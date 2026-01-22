/**
 * PageContainer Component
 * 
 * Responsive container for page content that adapts between mobile and desktop views.
 * Provides full-width layout on mobile with padding, and centered max-width on desktop.
 */

import { memo, ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  maxWidth?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  className?: string
}

const PageContainer = memo(function PageContainer({
  children,
  maxWidth = '2xl',
  className = '',
}: PageContainerProps) {
  // Mobile-first approach: full width on mobile, constrained on desktop
  const widthClasses = {
    '2xl': 'w-full px-4 md:max-w-2xl md:mx-auto',  // 672px max on desktop
    '3xl': 'w-full px-4 md:max-w-3xl md:mx-auto',  // 768px max on desktop
    '4xl': 'w-full px-4 md:max-w-4xl md:mx-auto',  // 896px max on desktop
    '5xl': 'w-full px-4 md:max-w-5xl md:mx-auto',  // 1024px max on desktop
    '6xl': 'w-full px-4 md:max-w-6xl md:mx-auto',  // 1152px max on desktop
    '7xl': 'w-full px-4 md:max-w-7xl md:mx-auto',  // 1280px max on desktop
  }
  
  return (
    <div className={`${widthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  )
})

export default PageContainer
