/**
 * Phone Container Component
 * Creates a phone-first app shell that feels like a native iOS app
 */

import { ReactNode } from 'react';
import './PhoneContainer.css';

interface PhoneContainerProps {
  children: ReactNode;
}

export function PhoneContainer({ children }: PhoneContainerProps) {
  return (
    <div className="phone-container">
      <div className="phone-container__screen">
        <div className="phone-container__safe-area">
          {children}
        </div>
      </div>
    </div>
  );
}
