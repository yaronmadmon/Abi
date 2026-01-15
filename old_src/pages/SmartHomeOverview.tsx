/**
 * Smart Home Overview
 * At a glance view of your smart home
 */

import { OverviewPage } from './OverviewPage';

export function SmartHomeOverview() {
  return (
    <OverviewPage
      title="Smart Home"
      description="Devices, rules, and scenarios that make your home work for you."
      links={[
        { path: '/smart-home/devices', label: 'Devices' },
        { path: '/smart-home/rules', label: 'Rules' },
        { path: '/smart-home/scenarios', label: 'Scenarios' },
      ]}
    />
  );
}
