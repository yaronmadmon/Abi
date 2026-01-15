/**
 * Pets Page
 * List and manage pets in the family
 */

import { useState } from 'react';
import { Pet, PetType } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import { PetCard } from '@/ui/components/PetCard';
import './Page.css';
import './EntityList.css';

// Placeholder data - in production, this would come from a data store
const placeholderPets: Pet[] = [
  {
    id: 'pet-dog-1',
    householdId: 'household-1',
    name: 'Buddy',
    type: PetType.DOG,
    breed: 'Golden Retriever',
    dateOfBirth: '2019-08-15',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop',
    vetName: 'Dr. Emily Chen',
    vetPhone: '+1 (555) 456-7890',
    notes: 'Very friendly and loves to play fetch. Needs daily walks.',
    medicalNotes: 'Up to date on all vaccinations. Next checkup: March 2025',
    ownerIds: ['person-dad-1', 'person-mom-1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pet-cat-1',
    householdId: 'household-1',
    name: 'Luna',
    type: PetType.CAT,
    breed: 'Persian',
    dateOfBirth: '2020-02-10',
    avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop',
    vetName: 'Dr. Emily Chen',
    vetPhone: '+1 (555) 456-7890',
    notes: 'Calm and affectionate. Loves to nap in sunny spots.',
    medicalNotes: 'All vaccinations current. Spayed. Next checkup: April 2025',
    ownerIds: ['person-mom-1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const PET_TYPES = [
  { value: PetType.DOG, label: 'Dog' },
  { value: PetType.CAT, label: 'Cat' },
  { value: PetType.BIRD, label: 'Bird' },
  { value: PetType.FISH, label: 'Fish' },
  { value: PetType.OTHER, label: 'Other' },
];

export function Pets() {
  const [pets, setPets] = useState<Pet[]>(placeholderPets);
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: PetType.DOG, 
    notes: '', 
    vetName: '', 
    vetPhone: '' 
  });

  const handleEdit = (pet: Pet) => {
    setEditingId(pet.id);
    setFormData({
      name: pet.name,
      type: pet.type,
      notes: pet.notes || '',
      vetName: pet.vetName || '',
      vetPhone: pet.vetPhone || '',
    });
    setShowForm(true);
    setSelectedPet(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      // Update existing pet
      setPets(pets.map(p => 
        p.id === editingId 
          ? {
              ...p,
              name: formData.name.trim(),
              type: formData.type,
              notes: formData.notes.trim() || undefined,
              vetName: formData.vetName.trim() || undefined,
              vetPhone: formData.vetPhone.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      ));
      setEditingId(null);
    } else {
      // Create new pet
      const newPet: Pet = {
        id: `pet-${Date.now()}`,
        householdId: 'household-1',
        name: formData.name.trim(),
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        vetName: formData.vetName.trim() || undefined,
        vetPhone: formData.vetPhone.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPets([...pets, newPet]);
      setSelectedPet(newPet);
    }

    setFormData({ name: '', type: PetType.DOG, notes: '', vetName: '', vetPhone: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      setPets(pets.filter(p => p.id !== id));
      if (selectedPet?.id === id) {
        setSelectedPet(null);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', type: PetType.DOG, notes: '', vetName: '', vetPhone: '' });
    setShowForm(false);
    setEditingId(null);
  };

  // Get related documents for selected pet (would come from data store in production)
  const relatedDocuments: any[] = []; // Placeholder - would filter documents by linkedToPetId

  if (selectedPet) {
    return (
      <div className="page">
        <OrientationHeader 
          title={selectedPet.name} 
          description="Pet details" 
        />
        <NowNext 
          now={`You're viewing ${selectedPet.name}'s information.`}
          next="See related documents or update details."
        />
        <div className="entity-list__toolbar">
          <button
            onClick={() => {
              setSelectedPet(null);
              setEditingId(null);
            }}
            className="entity-list__add-button"
          >
            ← Back to list
          </button>
          <button
            onClick={() => handleEdit(selectedPet)}
            className="entity-list__add-button"
            style={{ marginLeft: 'var(--spacing-md)' }}
          >
            Edit
          </button>
        </div>
        <PetCard pet={selectedPet} />
        
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
        title="Pets" 
        description="Your family pets" 
      />

      <NowNext 
        now="Keep track of your pets and their information."
        next="Add a pet to get started."
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', type: PetType.DOG, notes: '', vetName: '', vetPhone: '' });
            }
          }}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Pet'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="pet-name" className="entity-form__label">
              Pet Name
            </label>
            <input
              id="pet-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="entity-form__input"
              placeholder="Pet's name"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="pet-type" className="entity-form__label">
              Type
            </label>
            <select
              id="pet-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PetType })}
              className="entity-form__input"
            >
              {PET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="entity-form__field">
            <label htmlFor="vet-name" className="entity-form__label">
              Vet Name (optional)
            </label>
            <input
              id="vet-name"
              type="text"
              value={formData.vetName}
              onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
              className="entity-form__input"
              placeholder="Veterinarian name"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="vet-phone" className="entity-form__label">
              Vet Phone (optional)
            </label>
            <input
              id="vet-phone"
              type="tel"
              value={formData.vetPhone}
              onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
              className="entity-form__input"
              placeholder="Vet phone number"
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="pet-notes" className="entity-form__label">
              Notes (optional)
            </label>
            <textarea
              id="pet-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="entity-form__input"
              placeholder="Any notes about your pet..."
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
        {pets.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">🐾</div>
            <h2 className="entity-list__empty-title">Add your pets</h2>
            <p className="entity-list__empty-description">
              Keep track of your pets and their important information. Add each pet to remember vet details and notes.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Pet
            </button>
          </div>
        ) : pets.length > 0 ? (
          <div className="entity-list__list">
            {pets.map((pet) => (
              <div key={pet.id} className="entity-list__item">
                <div 
                  className="entity-list__item-content"
                  onClick={() => setSelectedPet(pet)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="entity-list__item-title">{pet.name}</h3>
                  <p className="entity-list__item-description">
                    {PET_TYPES.find(t => t.value === pet.type)?.label || 'Pet'}
                  </p>
                  {pet.vetName && (
                    <p className="entity-list__item-description">Vet: {pet.vetName}</p>
                  )}
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pet);
                    }}
                    className="entity-list__edit-button"
                    aria-label="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pet.id);
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
