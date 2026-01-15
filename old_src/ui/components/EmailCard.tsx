/**
 * Email Card Component
 * Displays an email with status, priority, and actions
 */

import { Email, EmailPriority } from '@/types/communication';
import { formatEmailDate, getEmailPriorityColor } from '@/utils/emails';
import './EmailCard.css';

interface EmailCardProps {
  email: Email;
  onOpen?: (email: Email) => void;
  onStar?: (email: Email) => void;
  onMarkRead?: (email: Email) => void;
  showThread?: boolean;
}

export function EmailCard({
  email,
  onOpen,
  onStar,
  onMarkRead,
  showThread = false,
}: EmailCardProps) {
  const handleOpen = () => {
    if (onOpen) {
      onOpen(email);
    }
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStar) {
      onStar(email);
    }
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead) {
      onMarkRead(email);
    }
  };

  const fromDisplay = email.from.name || email.from.email;
  const subjectPreview = email.subject || '(No subject)';
  const bodyPreview = email.body.substring(0, 150).replace(/\n/g, ' ');

  return (
    <div
      className={`email-card ${!email.read ? 'email-card--unread' : ''} ${email.starred ? 'email-card--starred' : ''}`}
      onClick={handleOpen}
    >
      <div className="email-card__header">
        <div className="email-card__meta">
          {email.priority !== EmailPriority.NORMAL && (
            <div
              className="email-card__priority"
              style={{ backgroundColor: getEmailPriorityColor(email.priority) }}
              title={`Priority: ${email.priority}`}
            />
          )}
          <div className="email-card__from">{fromDisplay}</div>
          {showThread && (
            <div className="email-card__thread-indicator">Thread</div>
          )}
        </div>
        <div className="email-card__actions">
          <button
            onClick={handleStar}
            className={`email-card__star ${email.starred ? 'email-card__star--active' : ''}`}
            aria-label={email.starred ? 'Unstar' : 'Star'}
            title={email.starred ? 'Unstar' : 'Star'}
          >
            ★
          </button>
          {!email.read && (
            <button
              onClick={handleMarkRead}
              className="email-card__mark-read"
              aria-label="Mark as read"
              title="Mark as read"
            >
              ✓
            </button>
          )}
        </div>
      </div>

      <div className="email-card__subject">{subjectPreview}</div>
      
      {bodyPreview && (
        <div className="email-card__preview">{bodyPreview}</div>
      )}

      <div className="email-card__footer">
        <div className="email-card__date">
          {formatEmailDate(email.receivedAt || email.sentAt || email.createdAt)}
        </div>
        {email.labels && email.labels.length > 0 && (
          <div className="email-card__labels">
            {email.labels.map((label) => (
              <span key={label} className="email-card__label">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
