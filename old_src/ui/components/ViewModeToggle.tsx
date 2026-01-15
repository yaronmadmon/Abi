/**
 * View Mode Toggle Component
 * Allows switching between mobile and desktop view modes
 */

import { useViewMode } from '@/context/ViewModeContext';
import './ViewModeToggle.css';

interface ViewModeToggleProps {
  compact?: boolean;
}

export function ViewModeToggle({ compact = false }: ViewModeToggleProps = {}) {
  const { viewMode, setViewMode } = useViewMode();

  const handleToggle = () => {
    if (viewMode === 'auto') {
      setViewMode('desktop');
    } else if (viewMode === 'desktop') {
      setViewMode('mobile');
    } else {
      setViewMode('auto');
    }
  };

  const getLabel = () => {
    if (viewMode === 'mobile') return 'Mobile';
    if (viewMode === 'desktop') return 'Desktop';
    return 'Auto';
  };

  return (
    <div className={`view-mode-toggle ${compact ? 'view-mode-toggle--compact' : ''}`}>
      <button
        onClick={handleToggle}
        className="view-mode-toggle__button"
        aria-label={`View mode: ${getLabel()}. Click to switch.`}
        title={`Current: ${getLabel()}. Click to switch mode.`}
      >
        <span className="view-mode-toggle__icon">
          {viewMode === 'mobile' ? '📱' : viewMode === 'desktop' ? '🖥️' : '🔄'}
        </span>
        <span className="view-mode-toggle__label">{getLabel()}</span>
      </button>
    </div>
  );
}
