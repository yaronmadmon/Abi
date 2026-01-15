/**
 * Pet Card Component
 * Prominent card showing pet summary with quick actions
 */

import { Pet, PetType } from '@/models';
import './PetCard.css';

interface PetCardProps {
  pet: Pet;
}

const PET_TYPE_LABELS: Record<PetType, string> = {
  [PetType.DOG]: 'Dog',
  [PetType.CAT]: 'Cat',
  [PetType.OTHER]: 'Pet',
};

export function PetCard({ pet }: PetCardProps) {
  const handleCallVet = () => {
    if (pet.vetPhone) {
      window.location.href = `tel:${pet.vetPhone}`;
    }
  };

  return (
    <div className="pet-card">
      <div className="pet-card__header">
        <div className="pet-card__avatar">
          {pet.name.charAt(0).toUpperCase()}
        </div>
        <div className="pet-card__info">
          <h2 className="pet-card__name">{pet.name}</h2>
          <p className="pet-card__type">
            {PET_TYPE_LABELS[pet.type]}
          </p>
        </div>
      </div>

      {(pet.vetName || pet.vetPhone || pet.notes) && (
        <div className="pet-card__details">
          {pet.vetName && (
            <div className="pet-card__detail-item">
              <span className="pet-card__detail-label">Vet:</span>
              <span className="pet-card__detail-value">{pet.vetName}</span>
            </div>
          )}
          {pet.vetPhone && (
            <div className="pet-card__detail-item">
              <span className="pet-card__detail-label">Vet Phone:</span>
              <span className="pet-card__detail-value">{pet.vetPhone}</span>
            </div>
          )}
          {pet.notes && (
            <div className="pet-card__detail-item">
              <span className="pet-card__detail-label">Notes:</span>
              <span className="pet-card__detail-value">{pet.notes}</span>
            </div>
          )}
        </div>
      )}

      {pet.vetPhone && (
        <div className="pet-card__actions">
          <button
            onClick={handleCallVet}
            className="pet-card__action-button"
            aria-label="Call Vet"
          >
            📞 Call Vet
          </button>
        </div>
      )}
    </div>
  );
}
