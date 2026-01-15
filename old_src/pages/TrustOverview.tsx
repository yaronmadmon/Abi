/**
 * Trust & Safety Overview
 * At a glance view of trust and safety settings
 */

import { OverviewPage } from './OverviewPage';

export function TrustOverview() {
  return (
    <OverviewPage
      title="Trust & Safety"
      description="Privacy, permissions, access, and the ways your family keeps everything safe and secure."
      links={[
        { path: '/trust/permissions', label: 'Permissions' },
        { path: '/trust/privacy', label: 'Privacy' },
        { path: '/trust/emergency', label: 'Emergency Access' },
        { path: '/trust/history', label: 'History' },
      ]}
    />
  );
}
