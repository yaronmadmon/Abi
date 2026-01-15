/**
 * Quick Action Card Component
 * Simple card for quick actions on the Today landing page
 */

import { ReactNode } from 'react';
import './QuickActionCard.css';

interface QuickActionCardProps {
  icon: string;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  children?: ReactNode;
}

export function QuickActionCard({ icon, title, description, onClick, href, children }: QuickActionCardProps) {
  const className = 'quick-action-card';
  
  const content = (
    <>
      <div className="quick-action-card__icon">{icon}</div>
      <div className="quick-action-card__content">
        <h3 className="quick-action-card__title">{title}</h3>
        {description && (
          <p className="quick-action-card__description">{description}</p>
        )}
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}
