/**
 * Subscription Card Component
 * Displays subscription information (calm, read-only)
 */

import { Subscription, SubscriptionFrequency } from '@/types/bills';
import { formatCurrency, formatBillDate } from '@/utils/bills';
import './SubscriptionCard.css';

interface SubscriptionCardProps {
  subscription: Subscription;
  onView?: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onView }: SubscriptionCardProps) {
  const handleClick = () => {
    if (onView) {
      onView(subscription);
    }
  };

  const getFrequencyLabel = (frequency: SubscriptionFrequency): string => {
    switch (frequency) {
      case SubscriptionFrequency.WEEKLY:
        return 'Weekly';
      case SubscriptionFrequency.MONTHLY:
        return 'Monthly';
      case SubscriptionFrequency.QUARTERLY:
        return 'Quarterly';
      case SubscriptionFrequency.YEARLY:
        return 'Yearly';
      default:
        return frequency;
    }
  };

  const getMonthlyEquivalent = (): number => {
    switch (subscription.frequency) {
      case SubscriptionFrequency.WEEKLY:
        return subscription.amount * 4.33;
      case SubscriptionFrequency.MONTHLY:
        return subscription.amount;
      case SubscriptionFrequency.QUARTERLY:
        return subscription.amount / 3;
      case SubscriptionFrequency.YEARLY:
        return subscription.amount / 12;
      default:
        return subscription.amount;
    }
  };

  return (
    <div
      className={`subscription-card ${subscription.status === 'active' ? '' : 'subscription-card--inactive'}`}
      onClick={handleClick}
    >
      <div className="subscription-card__header">
        <div className="subscription-card__info">
          <h3 className="subscription-card__name">{subscription.name}</h3>
          <div className="subscription-card__payee">{subscription.payee}</div>
        </div>
        <div className="subscription-card__amount">
          {formatCurrency(subscription.amount, subscription.currency)}
          <span className="subscription-card__frequency">/{subscription.frequency}</span>
        </div>
      </div>

      <div className="subscription-card__meta">
        <div className="subscription-card__meta-item">
          <span className="subscription-card__meta-label">Frequency:</span>
          <span className="subscription-card__meta-value">{getFrequencyLabel(subscription.frequency)}</span>
        </div>
        <div className="subscription-card__meta-item">
          <span className="subscription-card__meta-label">Monthly equivalent:</span>
          <span className="subscription-card__meta-value">
            {formatCurrency(getMonthlyEquivalent(), subscription.currency)}
          </span>
        </div>
        {subscription.nextBillingDate && (
          <div className="subscription-card__meta-item">
            <span className="subscription-card__meta-label">Next billing:</span>
            <span className="subscription-card__meta-value">
              {formatBillDate(subscription.nextBillingDate)}
            </span>
          </div>
        )}
      </div>

      {subscription.description && (
        <p className="subscription-card__description">{subscription.description}</p>
      )}

      <div className="subscription-card__footer">
        {subscription.category && (
          <div className="subscription-card__category">{subscription.category}</div>
        )}
        {subscription.autoDetected && (
          <div className="subscription-card__auto-badge">Auto-detected</div>
        )}
      </div>
    </div>
  );
}
