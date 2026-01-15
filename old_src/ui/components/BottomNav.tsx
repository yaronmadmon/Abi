/**
 * Bottom Navigation Component
 * Mobile-first navigation pattern
 */

import { useLocation, Link } from 'react-router-dom';
import './BottomNav.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const bottomNavItems: NavItem[] = [
  { path: '/today', label: 'Today', icon: '📅' },
  { path: '/people', label: 'People', icon: '👥' },
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/daily-life', label: 'Daily Life', icon: '✨' },
  { path: '/memories/documents', label: 'Documents', icon: '📄' },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {bottomNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav__item ${isActive(item.path) ? 'bottom-nav__item--active' : ''}`}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
