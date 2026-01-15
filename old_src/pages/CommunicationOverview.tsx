/**
 * Communication Overview
 * At a glance view of your communication
 */

import { OverviewPage } from './OverviewPage';

export function CommunicationOverview() {
  return (
    <OverviewPage
      title="Communication"
      description="How your family stays connected and communicates with each other and the outside world."
      links={[
        { path: '/communication/email', label: 'Email' },
        { path: '/communication/messages', label: 'Messages' },
        { path: '/communication/family-notes', label: 'Family Notes' },
        { path: '/communication/announcements', label: 'Announcements' },
        { path: '/communication/contacts', label: 'External Contacts' },
      ]}
    />
  );
}
