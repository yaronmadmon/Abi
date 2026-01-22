'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  subtitle?: string
  icon?: string | LucideIcon
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  variant?: 'default' | 'gradient'
}

export default function SummaryCard({
  title,
  subtitle,
  icon,
  href,
  onClick,
  children,
  variant = 'default',
}: SummaryCardProps) {
  const baseClasses = 'glass-card p-5 mb-4 transition-all duration-200'
  const interactiveClasses = href || onClick
    ? 'hover:shadow-soft-lg active:scale-[0.98] cursor-pointer'
    : ''

  const variantClasses =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-100'
      : ''

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && (
              typeof icon === 'string' ? (
                <span className="text-xl">{icon}</span>
              ) : (
                (() => {
                  const IconComponent = icon
                  return <IconComponent className="w-5 h-5" style={{ color: 'var(--icon-color)' }} strokeWidth={1.5} />
                })()
              )
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {(href || onClick) && (
          <span className="text-sm text-blue-600 font-medium">See all →</span>
        )}
      </div>
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${interactiveClasses} ${variantClasses} block`}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${interactiveClasses} ${variantClasses} w-full text-left`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      {content}
    </div>
  )
}
