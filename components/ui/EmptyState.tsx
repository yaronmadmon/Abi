/**
 * Empty State Component
 * 
 * Shows when there's no data to display.
 */

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <Icon 
          className="w-12 h-12 mb-4" 
          style={{ color: 'var(--text-muted)' }}
          strokeWidth={1.5} 
        />
      )}
      <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p 
          className="text-sm mb-6 max-w-md"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-full text-white transition-all duration-250 hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: 'var(--accent-primary)',
            boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
})

export default EmptyState
