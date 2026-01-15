/**
 * Contact Card Component
 * Displays contact information with relationship context
 */

import { Contact, RelationshipType } from '@/types/communication';
import { getContactDisplayName, getRelationshipDisplayName } from '@/utils/contacts';
import './ContactCard.css';

interface ContactCardProps {
  contact: Contact;
  onOpen?: (contact: Contact) => void;
  onEmail?: (contact: Contact) => void;
}

export function ContactCard({
  contact,
  onOpen,
  onEmail,
}: ContactCardProps) {
  const handleOpen = () => {
    if (onOpen) {
      onOpen(contact);
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEmail && contact.email) {
      onEmail(contact);
    }
  };

  return (
    <div className="contact-card" onClick={handleOpen}>
      <div className="contact-card__header">
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={getContactDisplayName(contact)}
            className="contact-card__avatar"
          />
        ) : (
          <div className="contact-card__avatar-placeholder">
            {contact.firstName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="contact-card__info">
          <h3 className="contact-card__name">{getContactDisplayName(contact)}</h3>
          {contact.relationship && (
            <div className="contact-card__relationship">
              {getRelationshipDisplayName(contact.relationship)}
            </div>
          )}
        </div>
      </div>

      <div className="contact-card__details">
        {contact.email && (
          <div className="contact-card__detail">
            <span className="contact-card__detail-label">Email:</span>
            <span className="contact-card__detail-value">{contact.email}</span>
            <button
              onClick={handleEmail}
              className="contact-card__email-button"
              aria-label="Send email"
              title="Send email"
            >
              ✉
            </button>
          </div>
        )}
        {contact.phone && (
          <div className="contact-card__detail">
            <span className="contact-card__detail-label">Phone:</span>
            <span className="contact-card__detail-value">{contact.phone}</span>
          </div>
        )}
        {contact.company && (
          <div className="contact-card__detail">
            <span className="contact-card__detail-label">Company:</span>
            <span className="contact-card__detail-value">{contact.company}</span>
          </div>
        )}
        {contact.jobTitle && (
          <div className="contact-card__detail">
            <span className="contact-card__detail-label">Title:</span>
            <span className="contact-card__detail-value">{contact.jobTitle}</span>
          </div>
        )}
      </div>

      {contact.relationshipNotes && (
        <div className="contact-card__relationship-notes">
          <div className="contact-card__relationship-notes-title">Relationship Context</div>
          <div className="contact-card__relationship-notes-text">
            {contact.relationshipNotes.split('\n').slice(-2).join(' ')}
          </div>
        </div>
      )}

      {contact.tags.length > 0 && (
        <div className="contact-card__tags">
          {contact.tags.map((tag) => (
            <span key={tag} className="contact-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
