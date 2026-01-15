/**
 * Orientation Header Component
 * Provides consistent orientation layer showing where the user is and what the section is about
 */

import './OrientationHeader.css';

interface OrientationHeaderProps {
  title: string;
  description: string;
}

export function OrientationHeader({ title, description }: OrientationHeaderProps) {
  return (
    <div className="orientation-header">
      <div className="orientation-header__content">
        <h1 className="orientation-header__title">{title}</h1>
        <p className="orientation-header__description">{description}</p>
      </div>
    </div>
  );
}
