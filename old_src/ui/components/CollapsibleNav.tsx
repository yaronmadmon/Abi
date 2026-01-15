/**
 * Collapsible Navigation Component
 * Hierarchical navigation with hybrid expand/collapse + navigate behavior
 * 
 * Behavior:
 * - Click chevron/arrow → expand/collapse (no navigation)
 * - Click parent label → navigate to parent overview page
 * - Click child item → navigate to sub-route
 * - Expanded state persists across navigation
 * - Active state highlights parent and child
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CollapsibleNav.css';

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  children?: NavItem[];
}

interface CollapsibleNavProps {
  items: NavItem[];
}

export function CollapsibleNav({ items }: CollapsibleNavProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Initialize expanded state: expand items whose children contain the current route
  useEffect(() => {
    const initiallyExpanded = new Set<string>();
    
    const checkItem = (item: NavItem): boolean => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          if (child.children) {
            return checkItem(child);
          }
          return location.pathname.startsWith(child.path);
        });
        
        if (hasActiveChild || location.pathname.startsWith(item.path)) {
          initiallyExpanded.add(item.path);
          return true;
        }
        
        // Also check if any child has active grandchildren
        item.children.forEach(child => {
          if (child.children) {
            checkItem(child);
          }
        });
      }
      
      return location.pathname.startsWith(item.path);
    };

    items.forEach(item => checkItem(item));
    setExpandedItems(initiallyExpanded);
  }, [location.pathname, items]);

  // Load persisted expanded state from localStorage
  useEffect(() => {
    const persisted = localStorage.getItem('nav-expanded');
    if (persisted) {
      try {
        const persistedSet = new Set<string>(JSON.parse(persisted));
        // Merge with initially expanded items
        setExpandedItems(prev => new Set([...prev, ...persistedSet]));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Persist expanded state to localStorage
  useEffect(() => {
    if (expandedItems.size > 0) {
      localStorage.setItem('nav-expanded', JSON.stringify(Array.from(expandedItems)));
    }
  }, [expandedItems]);

  const toggleExpanded = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const isExpanded = (path: string) => expandedItems.has(path);

  const isParentActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (!item.children) return false;
    return item.children.some(child => {
      if (location.pathname === child.path) return true;
      if (child.children) return isParentActive(child);
      return false;
    });
  };

  const isChildActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => isChildActive(child));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, level: number = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.path);
    const parentActive = isParentActive(item);
    const childActive = isChildActive(item);

    return (
      <div key={item.path} className={`collapsible-nav__item collapsible-nav__item--level-${level}`}>
        <div className="collapsible-nav__item-row">
          {hasChildren ? (
            <>
              <button
                type="button"
                className="collapsible-nav__toggle"
                onClick={(e) => toggleExpanded(item.path, e)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                <span className={`collapsible-nav__chevron ${expanded ? 'collapsible-nav__chevron--expanded' : ''}`}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 2L5 4L3 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>
              <Link
                to={item.path}
                className={`collapsible-nav__link collapsible-nav__link--parent ${parentActive ? 'collapsible-nav__link--active' : ''}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="collapsible-nav__label">{item.label}</span>
              </Link>
            </>
          ) : (
            <Link
              to={item.path}
              className={`collapsible-nav__link ${childActive ? 'collapsible-nav__link--active' : ''}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <span className="collapsible-nav__label">{item.label}</span>
            </Link>
          )}
        </div>
        
        {hasChildren && expanded && (
          <div className="collapsible-nav__children">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="collapsible-nav" aria-label="Main navigation">
      {items.map(item => renderNavItem(item))}
    </nav>
  );
}
