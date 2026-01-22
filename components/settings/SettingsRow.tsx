'use client'

import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

type RowKind = 'navigation' | 'toggle' | 'readonly' | 'action' | 'danger'

interface SettingsRowProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  value?: string
  kind?: RowKind
  disabled?: boolean
  isLast?: boolean

  // Navigation / actions
  onPress?: () => void

  // Toggle
  toggled?: boolean
  onToggle?: (next: boolean) => void

  rightAccessory?: ReactNode
}

function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(!checked)
      }}
      className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? 'var(--accent-blue)' : 'var(--border-color)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform"
        style={{
          backgroundColor: 'white',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        }}
      />
    </button>
  )
}

export default function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  kind = 'navigation',
  disabled,
  isLast,
  onPress,
  toggled,
  onToggle,
  rightAccessory,
}: SettingsRowProps) {
  const isPressable = !!onPress && kind !== 'readonly' && kind !== 'toggle'
  const showChevron = kind === 'navigation' && !!onPress && !disabled
  const isDanger = kind === 'danger'
  const iconBg =
    kind === 'danger'
      ? 'rgba(185, 28, 28, 0.10)'
      : kind === 'toggle'
      ? 'rgba(59, 130, 246, 0.10)'
      : 'rgba(59, 130, 246, 0.10)'

  const RowTag: any = isPressable ? 'button' : 'div'
  const rowProps = isPressable
    ? {
        type: 'button',
        onClick: () => onPress?.(),
      }
    : {}

  return (
    <RowTag
      {...rowProps}
      className={[
        'relative w-full text-left flex items-center gap-3 px-4 py-3',
        isPressable ? 'card-press' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      style={{
        backgroundColor: 'transparent',
      }}
      disabled={isPressable ? disabled : undefined}
      aria-disabled={disabled || undefined}
    >
      {icon ? (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-soft" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-[15px] font-medium truncate" style={{ color: isDanger ? '#b91c1c' : 'var(--text-primary)' }}>
            {title}
          </div>
        </div>
        {subtitle ? (
          <div className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      {value ? (
        <div className="text-sm ml-2 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
          {value}
        </div>
      ) : null}

      {rightAccessory ? <div className="ml-2 flex-shrink-0">{rightAccessory}</div> : null}

      {kind === 'toggle' ? (
        <div className="ml-2 flex-shrink-0">
          <Switch checked={!!toggled} disabled={disabled} onChange={(next) => onToggle?.(next)} />
        </div>
      ) : null}

      {showChevron ? (
        <ChevronRight className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} strokeWidth={2} />
      ) : null}

      {!isLast ? (
        <div className="absolute left-4 right-4 bottom-0 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
      ) : null}
    </RowTag>
  )
}

