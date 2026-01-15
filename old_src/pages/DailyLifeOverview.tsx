/**
 * Daily Life Overview
 * At a glance view of your daily tasks and routines
 */

import { OverviewPage } from './OverviewPage';
import { PreviewCard } from '@/ui/components';

export function DailyLifeOverview() {
  return (
    <OverviewPage
      title="Daily Life"
      description="Tasks, routines, scheduling, and the things that keep your household running smoothly."
      primaryAction={{
        label: "Create Task",
        path: "/daily-life/tasks"
      }}
      links={[
        { path: '/daily-life/tasks', label: 'Household Tasks' },
        { path: '/daily-life/scheduling', label: 'Scheduling' },
        { path: '/daily-life/routines', label: 'Routines' },
        { path: '/daily-life/vendors', label: 'Vendors & Services' },
        { path: '/daily-life/errands', label: 'Errands' },
      ]}
    />
  );
}
