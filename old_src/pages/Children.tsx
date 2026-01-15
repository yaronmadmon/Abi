/**
 * Children Page
 * List and manage children in your family
 */

import { useState } from 'react';
import { Person, PersonRole } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import { PersonCard } from '@/ui/components/PersonCard';
import './Page.css';
import './EntityList.css';

// Placeholder data - in production, this would come from a data store
const placeholderChildren: Person[] = [
  {
    id: 'person-brother-1',
    householdId: 'household-1',
    firstName: 'Ethan',
    lastName: 'Johnson',
    email: 'ethan.johnson@email.com',
    phone: '+1 (555) 234-5680',
    role: PersonRole.KID,
    dateOfBirth: '2010-11-08',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    preferences: { notes: 'Loves soccer and video games. Allergic to peanuts.' },
    foodLikes: ['Pizza', 'Ice cream', 'Chicken nuggets'],
    foodDislikes: ['Broccoli', 'Spinach'],
    foodAllergies: ['Peanuts'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'person-sister-1',
    householdId: 'household-1',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@email.com',
    phone: '+1 (555) 234-5681',
    role: PersonRole.KID,
    dateOfBirth: '2013-05-20',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    preferences: { notes: 'Enjoys dance classes and reading. Very organized!' },
    foodLikes: ['Pasta', 'Fruit', 'Yogurt'],
    foodDislikes: ['Spicy food'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function Children() {
  const [children, setChildren] = useState<Person[]>(placeholderChildren);
  const [showForm, setShowForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', notes: '' });

  const handleEdit = (person: Person) => {
    setEditingId(person.id);
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName || '',
      dateOfBirth: person.dateOfBirth || '',
      phone: person.phone || '',
      email: person.email || '',
      notes: (person.preferences?.notes as string) || '',
    });
    setShowForm(true);
    setSelectedPerson(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) return;

    if (editingId) {
      // Update existing person
      setChildren(children.map(p => 
        p.id === editingId 
          ? {
              ...p,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim() || undefined,
              dateOfBirth: formData.dateOfBirth || undefined,
              phone: formData.phone.trim() || undefined,
              email: formData.email.trim() || undefined,
              preferences: formData.notes.trim() ? { notes: formData.notes.trim() } : undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      ));
      setEditingId(null);
    } else {
      // Create new person
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        householdId: 'household-1',
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        role: PersonRole.KID,
        preferences: formData.notes.trim() ? { notes: formData.notes.trim() } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChildren([...children, newPerson]);
      setSelectedPerson(newPerson);
    }

    setFormData({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      setChildren(children.filter(p => p.id !== id));
      if (selectedPerson?.id === id) {
        setSelectedPerson(null);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', notes: '' });
    setShowForm(false);
    setEditingId(null);
  };

  // Get related documents for selected person (would come from data store in production)
  const relatedDocuments: any[] = []; // Placeholder - would filter documents by linkedToPersonId

  if (selectedPerson) {
    return (
      <div className="page">
        <OrientationHeader 
          title={selectedPerson.firstName + (selectedPerson.lastName ? ` ${selectedPerson.lastName}` : '')} 
          description="Family member details" 
        />
        <NowNext 
          now={`You're viewing ${selectedPerson.firstName}'s profile.`}
          next="Add information or see related items."
        />
        <div className="entity-list__toolbar">
          <button
            onClick={() => {
              setSelectedPerson(null);
              setEditingId(null);
            }}
            className="entity-list__add-button"
          >
            ← Back to list
          </button>
          <button
            onClick={() => handleEdit(selectedPerson)}
            className="entity-list__add-button"
            style={{ marginLeft: 'var(--spacing-md)' }}
          >
            Edit
          </button>
        </div>
        <PersonCard person={selectedPerson} />
        
        {relatedDocuments.length > 0 && (
          <div className="entity-list__related-section">
            <h3 className="entity-list__related-title">Related documents</h3>
            <div className="entity-list__related-list">
              {relatedDocuments.map((doc) => (
                <div key={doc.id} className="entity-list__related-item">
                  <span className="entity-list__related-icon">📄</span>
                  <span className="entity-list__related-text">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <OrientationHeader 
        title="Children" 
        description="Manage children in your family" 
      />

      <NowNext 
        now="Keep track of the children in your family"
        next="Add children to manage their information"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
              setEditingId(null);
              setFormData({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', notes: '' });
            }
          }}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Family Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="first-name" className="entity-form__label">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="entity-form__input"
              placeholder="First name"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="last-name" className="entity-form__label">
              Last Name (optional)
            </label>
            <input
              id="last-name"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="entity-form__input"
              placeholder="Last name"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="date-of-birth" className="entity-form__label">
              Birthday (optional)
            </label>
            <input
              id="date-of-birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="entity-form__input"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="phone" className="entity-form__label">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="entity-form__input"
              placeholder="Phone number"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="email" className="entity-form__label">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="entity-form__input"
              placeholder="Email address"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="notes" className="entity-form__label">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="entity-form__input"
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="entity-form__actions">
            <button
              type="button"
              onClick={handleCancel}
              className="entity-form__button entity-form__button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="entity-form__button entity-form__button--submit"
            >
              {editingId ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      )}

      <div className="entity-list__content">
        {children.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">🧒</div>
            <h2 className="entity-list__empty-title">Add your children</h2>
            <p className="entity-list__empty-description">
              Keep track of the children in your family. Add each child's name, birthday, and any notes you want to remember.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Family Member
            </button>
          </div>
        ) : children.length > 0 ? (
          <div className="entity-list__list">
            {children.map((child) => (
              <div key={child.id} className="entity-list__item">
                <div 
                  className="entity-list__item-content"
                  onClick={() => setSelectedPerson(child)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="entity-list__item-title">
                    {child.firstName} {child.lastName || ''}
                  </h3>
                  {child.dateOfBirth && (
                    <p className="entity-list__item-description">
                      Birthday: {new Date(child.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                  {child.preferences?.notes && (
                    <p className="entity-list__item-description">{child.preferences.notes as string}</p>
                  )}
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(child.id);
                    }}
                    className="entity-list__delete-button"
                    aria-label="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
