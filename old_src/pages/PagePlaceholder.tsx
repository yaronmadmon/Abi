/**
 * Placeholder Page Component
 * Guided empty state for pages that will be implemented
 */

import { Link } from 'react-router-dom';
import { OrientationHeader } from './OrientationHeader';
import './Page.css';
import './PagePlaceholder.css';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  primaryAction?: {
    label: string;
    path: string;
  };
}

export function PagePlaceholder({ 
  title, 
  description, 
  emptyTitle,
  emptyDescription,
  primaryAction 
}: PagePlaceholderProps) {
  return (
    <div className="page">
      <OrientationHeader 
        title={title} 
        description={description || ''} 
      />
      
      <div className="page-placeholder__empty">
        <div className="page-placeholder__empty-icon">📋</div>
        <h2 className="page-placeholder__empty-title">
          {emptyTitle || `${title} is coming soon`}
        </h2>
        <p className="page-placeholder__empty-description">
          {emptyDescription || `This section helps you manage ${title.toLowerCase()}. It will be available soon.`}
        </p>
        {primaryAction && (
          <Link to={primaryAction.path} className="page-placeholder__primary-button">
            {primaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
