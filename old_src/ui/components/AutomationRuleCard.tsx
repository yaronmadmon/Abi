/**
 * Automation Rule Card Component
 * Display automation rules with status and manual override
 */

import { AutomationRule, AutomationRuleStatus } from '@/types/smarthome';
import { getTriggerDescription, getActionDescription } from '@/utils/automation';
import './AutomationRuleCard.css';

interface AutomationRuleCardProps {
  rule: AutomationRule;
  onToggle?: (rule: AutomationRule) => void;
  onOverride?: (rule: AutomationRule) => void;
  onEdit?: (rule: AutomationRule) => void;
}

export function AutomationRuleCard({
  rule,
  onToggle,
  onOverride,
  onEdit,
}: AutomationRuleCardProps) {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(rule);
    }
  };

  const handleOverride = () => {
    if (onOverride) {
      onOverride(rule);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(rule);
    }
  };

  return (
    <div className={`automation-rule-card ${!rule.enabled ? 'automation-rule-card--disabled' : ''}`}>
      <div className="automation-rule-card__header">
        <div className="automation-rule-card__info">
          <h3 className="automation-rule-card__name">{rule.name}</h3>
          {rule.description && (
            <p className="automation-rule-card__description">{rule.description}</p>
          )}
        </div>
        <div className="automation-rule-card__status">
          <span className={`automation-rule-card__status-badge automation-rule-card__status-badge--${rule.status}`}>
            {rule.status}
          </span>
        </div>
      </div>

      <div className="automation-rule-card__trigger">
        <div className="automation-rule-card__label">When:</div>
        <div className="automation-rule-card__value">{getTriggerDescription(rule.trigger)}</div>
      </div>

      <div className="automation-rule-card__actions">
        <div className="automation-rule-card__label">Then:</div>
        <div className="automation-rule-card__actions-list">
          {rule.actions.map((action, index) => (
            <div key={index} className="automation-rule-card__action-item">
              {getActionDescription(action)}
            </div>
          ))}
        </div>
      </div>

      {rule.lastTriggeredAt && (
        <div className="automation-rule-card__meta">
          Last triggered: {new Date(rule.lastTriggeredAt).toLocaleString()}
        </div>
      )}

      {rule.nextScheduledAt && (
        <div className="automation-rule-card__meta">
          Next scheduled: {new Date(rule.nextScheduledAt).toLocaleString()}
        </div>
      )}

      <div className="automation-rule-card__footer">
        <button
          onClick={handleToggle}
          className={`automation-rule-card__button automation-rule-card__button--toggle ${rule.enabled ? 'automation-rule-card__button--enabled' : ''}`}
        >
          {rule.enabled ? 'Disable' : 'Enable'}
        </button>
        {rule.manualOverride && (
          <button
            onClick={handleOverride}
            className="automation-rule-card__button automation-rule-card__button--override"
          >
            Override
          </button>
        )}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="automation-rule-card__button automation-rule-card__button--edit"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
