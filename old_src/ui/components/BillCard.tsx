/**
 * Bill Card Component
 * Displays bill information (calm, read-only)
 */

import { Bill, BillStatus } from '@/models';
import { formatCurrency, formatBillDate, isBillOverdue, isBillDueSoon } from '@/utils/bills';
import './BillCard.css';

interface BillCardProps {
  bill: Bill;
  onView?: (bill: Bill) => void;
}

export function BillCard({ bill, onView }: BillCardProps) {
  const overdue = isBillOverdue(bill);
  const dueSoon = isBillDueSoon(bill);
  const isPaid = bill.status === BillStatus.PAID;

  const handleClick = () => {
    if (onView) {
      onView(bill);
    }
  };

  return (
    <div
      className={`bill-card ${isPaid ? 'bill-card--paid' : ''} ${dueSoon ? 'bill-card--due-soon' : ''} ${overdue ? 'bill-card--overdue' : ''}`}
      onClick={handleClick}
    >
      <div className="bill-card__header">
        <div className="bill-card__info">
          <h3 className="bill-card__title">{bill.title}</h3>
          <div className="bill-card__payee">{bill.payee}</div>
        </div>
        <div className="bill-card__amount">
          {formatCurrency(bill.amount, bill.currency)}
        </div>
      </div>

      <div className="bill-card__meta">
        <div className="bill-card__meta-item">
          <span className="bill-card__meta-label">Due date:</span>
          <span className={`bill-card__meta-value ${overdue ? 'bill-card__meta-value--overdue' : ''}`}>
            {formatBillDate(bill.dueDate)}
          </span>
        </div>
        {bill.category && (
          <div className="bill-card__meta-item">
            <span className="bill-card__meta-label">Category:</span>
            <span className="bill-card__meta-value">{bill.category}</span>
          </div>
        )}
      </div>

      {bill.description && (
        <p className="bill-card__description">{bill.description}</p>
      )}

      <div className="bill-card__status">
        <div className={`bill-card__status-badge bill-card__status-badge--${bill.status}`}>
          {bill.status === BillStatus.PAID && '✓ Paid'}
          {bill.status === BillStatus.PENDING && (dueSoon ? 'Due soon' : overdue ? 'Past due' : 'Pending')}
          {bill.status === BillStatus.OVERDUE && 'Past due'}
          {bill.status === BillStatus.CANCELLED && 'Cancelled'}
        </div>
        {bill.paidDate && (
          <div className="bill-card__paid-date">
            Paid on {new Date(bill.paidDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
