/**
 * Financial Summary Component
 * Calm, read-only financial overview (no alerts, no guilt)
 */

import { FinancialSummary } from '@/types/bills';
import { formatCurrency } from '@/utils/bills';
import './FinancialSummary.css';

interface FinancialSummaryProps {
  summary: FinancialSummary;
}

export function FinancialSummaryComponent({ summary }: FinancialSummaryProps) {
  return (
    <div className="financial-summary">
      <div className="financial-summary__calm-message">
        {summary.calmMessage}
      </div>

      <div className="financial-summary__sections">
        <div className="financial-summary__section">
          <h3 className="financial-summary__section-title">This Month</h3>
          <div className="financial-summary__metrics">
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Total bills</div>
              <div className="financial-summary__metric-value">
                {summary.currentMonth.totalBills}
              </div>
            </div>
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Total amount</div>
              <div className="financial-summary__metric-value">
                {formatCurrency(summary.currentMonth.totalAmount, summary.currentMonth.currency)}
              </div>
            </div>
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Paid</div>
              <div className="financial-summary__metric-value financial-summary__metric-value--paid">
                {formatCurrency(summary.currentMonth.paidAmount, summary.currentMonth.currency)}
              </div>
            </div>
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Remaining</div>
              <div className="financial-summary__metric-value">
                {formatCurrency(summary.currentMonth.pendingAmount, summary.currentMonth.currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="financial-summary__section">
          <h3 className="financial-summary__section-title">Subscriptions</h3>
          <div className="financial-summary__metrics">
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Active subscriptions</div>
              <div className="financial-summary__metric-value">
                {summary.subscriptions.totalSubscriptions}
              </div>
            </div>
            <div className="financial-summary__metric">
              <div className="financial-summary__metric-label">Monthly total</div>
              <div className="financial-summary__metric-value">
                {formatCurrency(summary.subscriptions.monthlyTotal, summary.subscriptions.currency)}
              </div>
            </div>
          </div>

          {Object.keys(summary.subscriptions.byCategory).length > 0 && (
            <div className="financial-summary__category-breakdown">
              <div className="financial-summary__category-title">By category</div>
              {Object.entries(summary.subscriptions.byCategory).map(([category, data]) => (
                <div key={category} className="financial-summary__category-item">
                  <span className="financial-summary__category-name">{category}</span>
                  <span className="financial-summary__category-value">
                    {data.count} subscription{data.count !== 1 ? 's' : ''} · {formatCurrency(data.total, summary.subscriptions.currency)}/mo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {summary.upcomingBills.length > 0 && (
        <div className="financial-summary__upcoming">
          <h3 className="financial-summary__section-title">Coming up this week</h3>
          <div className="financial-summary__upcoming-list">
            {summary.upcomingBills.map((bill) => (
              <div key={bill.id} className="financial-summary__upcoming-item">
                <span className="financial-summary__upcoming-name">{bill.title}</span>
                <span className="financial-summary__upcoming-amount">
                  {formatCurrency(bill.amount, bill.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
