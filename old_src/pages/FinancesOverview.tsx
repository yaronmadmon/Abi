/**
 * Finances Overview
 * At a glance view of your finances
 */

import { OverviewPage } from './OverviewPage';

export function FinancesOverview() {
  return (
    <OverviewPage
      title="Finances"
      description="Bills, subscriptions, payments, and budgets to keep your household finances clear and organized."
      links={[
        { path: '/finances/bills', label: 'Bills' },
        { path: '/finances/subscriptions', label: 'Subscriptions' },
        { path: '/finances/payments', label: 'Payments' },
        { path: '/finances/budgets', label: 'Budgets' },
      ]}
    />
  );
}
