/**
 * Adults Page
 * List and manage adult family members
 */

import { useState } from 'react';
import { Person, PersonRole } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import { PersonCard } from '@/ui/components/PersonCard';
import './Page.css';
import './EntityList.css';

// Placeholder data - in production, this would come from a data store
const placeholderAdults: Person[] = [
  {
    id: 'person-dad-1',
    householdId: 'household-1',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@email.com',
    phone: '+1 (555) 234-5678',
    role: PersonRole.ADULT,
    dateOfBirth: '1975-03-15',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    preferences: { notes: 'Loves reading and hiking on weekends' },
    foodLikes: ['Italian', 'BBQ', 'Steak'],
    foodDislikes: ['Cilantro'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'person-mom-1',
    householdId: 'household-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5679',
    role: PersonRole.ADULT,
    dateOfBirth: '1978-07-22',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    preferences: { notes: 'Enjoys gardening and baking with the kids' },
    foodLikes: ['Mediterranean', 'Baking', 'Vegetables'],
    foodAllergies: ['Shellfish'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function Adults() {
  const [adults, setAdults] = useState<Person[]>(placeholderAdults);
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
      setAdults(adults.map(p => 
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
        role: PersonRole.ADULT,
        preferences: formData.notes.trim() ? { notes: formData.notes.trim() } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAdults([...adults, newPerson]);
      setSelectedPerson(newPerson);
    }

    setFormData({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      setAdults(adults.filter(p => p.id !== id));
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
        title="Adults" 
        description="Manage adult family members" 
      />

      <NowNext 
        now="Add and manage the adults in your household"
        next="Start by adding your first family member"
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
        {adults.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">👨‍👩</div>
            <h2 className="entity-list__empty-title">Add your family members</h2>
            <p className="entity-list__empty-description">
              This is where you manage the adults in your household. Add each person who lives with you to keep track of family information, birthdays, and notes.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Family Member
            </button>
          </div>
        ) : adults.length > 0 ? (
          <div className="entity-list__list">
            {adults.map((person) => (
              <div key={person.id} className="entity-list__item">
                <div 
                  className="entity-list__item-content"
                  onClick={() => setSelectedPerson(person)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="entity-list__item-title">
                    {person.firstName} {person.lastName || ''}
                  </h3>
                  {person.dateOfBirth && (
                    <p className="entity-list__item-description">
                      Birthday: {new Date(person.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                  {person.preferences?.notes && (
                    <p className="entity-list__item-description">{person.preferences.notes as string}</p>
                  )}
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(person);
                    }}
                    className="entity-list__edit-button"
                    aria-label="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(person.id);
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
