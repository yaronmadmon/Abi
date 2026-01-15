/**
 * Preview Card Component
 * Lightweight, non-interactive summary card for overview pages
 * Each card links to its corresponding section
 */

import { Link } from 'react-router-dom';
import './PreviewCard.css';

interface PreviewCardProps {
  title: string;
  description?: string;
  to: string;
  icon?: string;
  metadata?: string;
}

export function PreviewCard({ title, description, to, icon, metadata }: PreviewCardProps) {
  return (
    <Link to={to} className="preview-card">
      {icon && (
        <div className="preview-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="preview-card__content">
        <h3 className="preview-card__title">{title}</h3>
        {description && (
          <p className="preview-card__description">{description}</p>
        )}
        {metadata && (
          <div className="preview-card__metadata">{metadata}</div>
        )}
      </div>
    </Link>
  );
}
