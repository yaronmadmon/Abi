/**
 * App Shell Component
 * Responsive layout: Mobile (phone container) or Desktop (full-width with sidebar)
 */

import { Outlet } from 'react-router-dom';
import { OfflineIndicator } from './OfflineIndicator';
import { BottomNav } from './BottomNav';
import { PhoneContainer } from './PhoneContainer';
import { CollapsibleNav } from './CollapsibleNav';
import { GlobalSearch } from './GlobalSearch';
import { ViewModeToggle } from './ViewModeToggle';
import { navigationConfig } from '@/router/navigation';
import { useViewMode } from '@/context/ViewModeContext';
import './AppShell.css';

export function AppShell() {
  const { isMobileView } = useViewMode();

  // Mobile layout: Phone container with bottom navigation
  if (isMobileView) {
    return (
      <PhoneContainer>
        <div className="app-shell app-shell--mobile">
          <OfflineIndicator className="app-shell__offline" />
          <main className="app-shell__main">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </PhoneContainer>
    );
  }

  // Desktop layout: Full-width with sidebar navigation
  return (
    <div className="app-shell app-shell--desktop">
      <OfflineIndicator className="app-shell__offline" />
      <aside className="app-shell__sidebar">
        <GlobalSearch />
        <ViewModeToggle />
        <CollapsibleNav items={navigationConfig} />
      </aside>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
