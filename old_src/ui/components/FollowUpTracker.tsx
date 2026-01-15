/**
 * Follow-up Tracker Component
 * Track "waiting for reply" items with gentle reminders
 */

import { FollowUp, FollowUpStatus } from '@/types/communication';
import {
  getFollowUpStatusLabel,
  getFollowUpStatusColor,
  formatExpectedResponseDate,
  isFollowUpOverdue,
  shouldSendReminder,
} from '@/utils/followups';
import './FollowUpTracker.css';

interface FollowUpTrackerProps {
  followUps: FollowUp[];
  onResolve?: (followUp: FollowUp) => void;
  onSendReminder?: (followUp: FollowUp) => void;
  onOpen?: (followUp: FollowUp) => void;
}

export function FollowUpTracker({
  followUps,
  onResolve,
  onSendReminder,
  onOpen,
}: FollowUpTrackerProps) {
  const activeFollowUps = followUps.filter(
    f => f.status === FollowUpStatus.WAITING || f.status === FollowUpStatus.REMINDED
  );
  const overdueFollowUps = activeFollowUps.filter(isFollowUpOverdue);
  const needsReminder = activeFollowUps.filter(shouldSendReminder);

  const handleResolve = (followUp: FollowUp, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResolve) {
      onResolve(followUp);
    }
  };

  const handleReminder = (followUp: FollowUp, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSendReminder) {
      onSendReminder(followUp);
    }
  };

  if (activeFollowUps.length === 0) {
    return (
      <div className="followup-tracker">
        <div className="followup-tracker__empty">
          <div className="followup-tracker__empty-icon">✓</div>
          <p className="followup-tracker__empty-text">No active follow-ups</p>
        </div>
      </div>
    );
  }

  return (
    <div className="followup-tracker">
      {(needsReminder.length > 0 || overdueFollowUps.length > 0) && (
        <div className="followup-tracker__alerts">
          {needsReminder.length > 0 && (
            <div className="followup-tracker__alert followup-tracker__alert--reminder">
              {needsReminder.length} follow-up{needsReminder.length !== 1 ? 's' : ''} need{needsReminder.length === 1 ? 's' : ''} a reminder
            </div>
          )}
          {overdueFollowUps.length > 0 && (
            <div className="followup-tracker__alert followup-tracker__alert--overdue">
              {overdueFollowUps.length} follow-up{overdueFollowUps.length !== 1 ? 's' : ''} overdue
            </div>
          )}
        </div>
      )}

      <div className="followup-tracker__list">
        {activeFollowUps.map((followUp) => {
          const isOverdue = isFollowUpOverdue(followUp);
          const needsReminderNow = shouldSendReminder(followUp);

          return (
            <div
              key={followUp.id}
              className={`followup-item ${isOverdue ? 'followup-item--overdue' : ''} ${needsReminderNow ? 'followup-item--needs-reminder' : ''}`}
              onClick={() => onOpen && onOpen(followUp)}
            >
              <div className="followup-item__header">
                <h3 className="followup-item__title">{followUp.title}</h3>
                <div
                  className="followup-item__status"
                  style={{ color: getFollowUpStatusColor(followUp.status) }}
                >
                  {getFollowUpStatusLabel(followUp.status)}
                </div>
              </div>

              {followUp.description && (
                <p className="followup-item__description">{followUp.description}</p>
              )}

              <div className="followup-item__meta">
                <div className="followup-item__waiting-for">
                  <span className="followup-item__meta-label">Waiting for:</span>
                  <span className="followup-item__meta-value">{followUp.waitingFor}</span>
                </div>
                {followUp.expectedResponseBy && (
                  <div className="followup-item__due-date">
                    <span className="followup-item__meta-label">Expected:</span>
                    <span className={`followup-item__meta-value ${isOverdue ? 'followup-item__meta-value--overdue' : ''}`}>
                      {formatExpectedResponseDate(followUp.expectedResponseBy)}
                    </span>
                  </div>
                )}
              </div>

              <div className="followup-item__actions">
                {needsReminderNow && (
                  <button
                    onClick={(e) => handleReminder(followUp, e)}
                    className="followup-item__button followup-item__button--reminder"
                  >
                    Send Reminder
                  </button>
                )}
                <button
                  onClick={(e) => handleResolve(followUp, e)}
                  className="followup-item__button followup-item__button--resolve"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
