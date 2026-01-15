/**
 * Person Card Component
 * Prominent card showing person summary with quick actions
 */

import { Person } from '@/models';
import './PersonCard.css';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const fullName = `${person.firstName}${person.lastName ? ` ${person.lastName}` : ''}`;
  const notes = person.preferences?.notes as string | undefined;

  const handleCall = () => {
    if (person.phone) {
      window.location.href = `tel:${person.phone}`;
    }
  };

  const handleText = () => {
    if (person.phone) {
      window.location.href = `sms:${person.phone}`;
    }
  };

  const handleEmail = () => {
    if (person.email) {
      window.location.href = `mailto:${person.email}`;
    }
  };

  return (
    <div className="person-card">
      <div className="person-card__header">
        <div className="person-card__avatar">
          {person.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="person-card__info">
          <h2 className="person-card__name">{fullName}</h2>
          <p className="person-card__role">
            {person.role === 'adult' ? 'Adult' : 'Child'}
          </p>
        </div>
      </div>

      {(person.phone || person.email || notes) && (
        <div className="person-card__details">
          {person.phone && (
            <div className="person-card__detail-item">
              <span className="person-card__detail-label">Phone:</span>
              <span className="person-card__detail-value">{person.phone}</span>
            </div>
          )}
          {person.email && (
            <div className="person-card__detail-item">
              <span className="person-card__detail-label">Email:</span>
              <span className="person-card__detail-value">{person.email}</span>
            </div>
          )}
          {notes && (
            <div className="person-card__detail-item">
              <span className="person-card__detail-label">Notes:</span>
              <span className="person-card__detail-value">{notes}</span>
            </div>
          )}
        </div>
      )}

      {(person.phone || person.email) && (
        <div className="person-card__actions">
          {person.phone && (
            <>
              <button
                onClick={handleCall}
                className="person-card__action-button"
                aria-label="Call"
              >
                📞 Call
              </button>
              <button
                onClick={handleText}
                className="person-card__action-button"
                aria-label="Text"
              >
                💬 Text
              </button>
            </>
          )}
          {person.email && (
            <button
              onClick={handleEmail}
              className="person-card__action-button"
              aria-label="Email"
            >
              📧 Email
            </button>
          )}
        </div>
      )}
    </div>
  );
}
