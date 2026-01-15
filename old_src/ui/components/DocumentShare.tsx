/**
 * Document Share Component
 * Simple family sharing - optional, read-only
 */

import { useState } from 'react';
import { Person, EntityId } from '@/models';
import './DocumentShare.css';

interface DocumentShareProps {
  documentId: string;
  sharedWithIds: EntityId[];
  familyMembers: Person[];
  onShare: (documentId: string, personIds: EntityId[]) => void;
}

export function DocumentShare({ documentId, sharedWithIds, familyMembers, onShare }: DocumentShareProps) {
  const [selectedIds, setSelectedIds] = useState<Set<EntityId>>(new Set(sharedWithIds));
  const [isOpen, setIsOpen] = useState(true); // Open by default when component is rendered

  const handleTogglePerson = (personId: EntityId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    onShare(documentId, Array.from(selectedIds));
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedIds(new Set(sharedWithIds)); // Reset to original
    setIsOpen(false);
  };

  if (!isOpen) {
    return null; // Share button is rendered by parent (DocumentCard)
  }

  return (
    <div className="document-share">
      <div className="document-share__header">
        <h3 className="document-share__title">Share with family</h3>
        <button
          onClick={handleCancel}
          className="document-share__close"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="document-share__content">
        <p className="document-share__description">
          Choose who can view this document. They'll have read-only access.
        </p>
        <div className="document-share__list">
          {familyMembers.length === 0 ? (
            <p className="document-share__empty">No family members added yet.</p>
          ) : (
            familyMembers.map((person) => {
              const isSelected = selectedIds.has(person.id);
              const fullName = `${person.firstName}${person.lastName ? ` ${person.lastName}` : ''}`;
              return (
                <label key={person.id} className="document-share__item">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTogglePerson(person.id)}
                    className="document-share__checkbox"
                  />
                  <span className="document-share__name">{fullName}</span>
                </label>
              );
            })
          )}
        </div>
      </div>
      <div className="document-share__actions">
        <button
          onClick={handleCancel}
          className="document-share__button document-share__button--cancel"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="document-share__button document-share__button--save"
        >
          Save
        </button>
      </div>
    </div>
  );
}
