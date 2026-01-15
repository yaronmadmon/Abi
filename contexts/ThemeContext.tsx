'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ViewMode = 'mobile' | 'desktop'
type ColorMode = 'light' | 'dark'

interface ThemeContextType {
  viewMode: ViewMode
  colorMode: ColorMode
  toggleViewMode: () => void
  toggleColorMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile')
  const [colorMode, setColorMode] = useState<ColorMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode
    
    if (savedViewMode === 'mobile' || savedViewMode === 'desktop') {
      setViewMode(savedViewMode)
    }
    
    if (savedColorMode === 'light' || savedColorMode === 'dark') {
      setColorMode(savedColorMode)
    }
    
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Apply view mode class to body
    document.body.classList.remove('mobile-mode', 'desktop-mode')
    document.body.classList.add(`${viewMode}-mode`)
    
    // Apply color mode class to html
    document.documentElement.classList.remove('light-mode', 'dark-mode')
    document.documentElement.classList.add(`${colorMode}-mode`)
    
    // Save to localStorage
    localStorage.setItem('viewMode', viewMode)
    localStorage.setItem('colorMode', colorMode)
  }, [viewMode, colorMode, mounted])

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'mobile' ? 'desktop' : 'mobile')
  }

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ viewMode, colorMode, toggleViewMode, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
