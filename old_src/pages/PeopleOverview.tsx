/**
 * People Overview
 * At a glance view of your family and people
 */

import { OverviewPage } from './OverviewPage';
import { PreviewCard } from '@/ui/components';

export function PeopleOverview() {
  return (
    <OverviewPage
      title="People"
      description="Everything about the people in your home and family."
      nowNext={{
        now: "Manage the people who live with you",
        next: "Add family members or update their information"
      }}
      primaryAction={{
        label: "Add Family Member",
        path: "/people/family/adults"
      }}
      links={[
        { path: '/people/profile', label: 'My Profile' },
        { path: '/people/family/adults', label: 'Adults' },
        { path: '/people/family/children', label: 'Children' },
        { path: '/people/guests', label: 'Guests & Caregivers' },
      ]}
    />
  );
}
