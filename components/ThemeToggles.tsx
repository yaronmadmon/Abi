'use client'

import { Smartphone, Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggles() {
  const { viewMode, colorMode, toggleViewMode, toggleColorMode } = useTheme()

  return (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <button
        onClick={toggleViewMode}
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        title={viewMode === 'mobile' ? 'Switch to Desktop Mode' : 'Switch to Mobile Mode'}
        aria-label={`Current: ${viewMode} mode`}
      >
        {viewMode === 'mobile' ? (
          <Smartphone className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={2} />
        ) : (
          <Monitor className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={2} />
        )}
      </button>

      {/* Color Mode Toggle */}
      <button
        onClick={toggleColorMode}
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        title={colorMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        aria-label={`Current: ${colorMode} mode`}
      >
        {colorMode === 'light' ? (
          <Moon className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={2} />
        ) : (
          <Sun className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={2} />
        )}
      </button>
    </div>
  )
}
