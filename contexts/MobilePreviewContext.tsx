'use client'

import { createContext, useContext } from 'react'

interface MobilePreviewContextType {
  isMobilePreview: boolean
}

const MobilePreviewContext = createContext<MobilePreviewContextType>({
  isMobilePreview: false,
})

export function MobilePreviewProvider({ 
  children, 
  isMobilePreview 
}: { 
  children: React.ReactNode
  isMobilePreview: boolean 
}) {
  return (
    <MobilePreviewContext.Provider value={{ isMobilePreview }}>
      {children}
    </MobilePreviewContext.Provider>
  )
}

export function useMobilePreview() {
  return useContext(MobilePreviewContext)
}
