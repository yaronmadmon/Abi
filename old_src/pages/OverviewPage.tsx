/**
 * Overview Page Component
 * Lightweight overview page template following: Orientation → Now/Next → Primary Card → Content
 */

import { Link, ReactNode } from 'react-router-dom';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './OverviewPage.css';

interface OverviewLink {
  path: string;
  label: string;
}

interface OverviewPageProps {
  title: string;
  description: string;
  links: OverviewLink[];
  cards?: ReactNode;
  summary?: ReactNode;
  primaryAction?: {
    label: string;
    path: string;
  };
  nowNext?: {
    now?: string;
    next?: string;
  };
}

export function OverviewPage({ title, description, links, cards, summary, primaryAction, nowNext }: OverviewPageProps) {
  return (
    <div className="page">
      <OrientationHeader title={title} description={description} />
      
      <NowNext now={nowNext?.now} next={nowNext?.next} />
      
      {primaryAction && (
        <div className="overview__primary-card">
          <Link to={primaryAction.path} className="overview__primary-card-link">
            <div className="overview__primary-card-content">
              <h2 className="overview__primary-card-title">{primaryAction.label}</h2>
              <p className="overview__primary-card-description">
                Get started by adding your first item
              </p>
            </div>
          </Link>
        </div>
      )}
      
      {cards && (
        <div className="overview__cards">
          {cards}
        </div>
      )}
      
      <nav className="overview__links" aria-label={`${title} sections`}>
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="overview__link">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
