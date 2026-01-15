/**
 * Home Overview
 * At a glance view of your home
 */

import { OverviewPage } from './OverviewPage';
import { PreviewCard } from '@/ui/components';

export function HomeOverview() {
  return (
    <OverviewPage
      title="Home"
      description="Your physical space, rooms, maintenance, and belongings."
      primaryAction={{
        label: "Add Room",
        path: "/home/rooms"
      }}
      links={[
        { path: '/home/rooms', label: 'Rooms & Areas' },
        { path: '/home/maintenance', label: 'Maintenance' },
        { path: '/home/assets', label: 'Assets' },
      ]}
    />
  );
}
