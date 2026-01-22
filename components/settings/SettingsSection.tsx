'use client'

import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  children: ReactNode
  description?: string
}

export default function SettingsSection({ title, children, description }: SettingsSectionProps) {
  return (
    <section className="mb-5">
      <div className="px-1 mb-2">
        <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-tertiary)' }}>
          {title}
        </div>
        {description ? (
          <div className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {description}
          </div>
        ) : null}
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="flex flex-col">{children}</div>
      </div>
    </section>
  )
}

