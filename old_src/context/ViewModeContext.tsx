/**
 * View Mode Context
 * Manages manual mobile/desktop mode switching
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'mobile' | 'desktop' | 'auto';

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isMobileView: boolean;
  isDesktopView: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app-view-mode';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ViewMode) || 'auto';
  });

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  // Determine actual view mode
  const isMobileView = viewMode === 'mobile' || (viewMode === 'auto' && isMobileScreen);
  const isDesktopView = viewMode === 'desktop' || (viewMode === 'auto' && !isMobileScreen);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isMobileView, isDesktopView }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
}
