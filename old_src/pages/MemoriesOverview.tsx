/**
 * Memories Overview
 * At a glance view of your memories and records
 */

import { OverviewPage } from './OverviewPage';

export function MemoriesOverview() {
  return (
    <OverviewPage
      title="Memories"
      description="Documents, notes, activity, and everything your family wants to remember and keep."
      links={[
        { path: '/memories/documents', label: 'Documents' },
        { path: '/memories/activity', label: 'Activity' },
        { path: '/memories/notes', label: 'Notes' },
        { path: '/memories/uploads', label: 'Uploads' },
      ]}
    />
  );
}
