/**
 * Rooms Page
 * List and manage rooms and areas in your home
 */

import { useState } from 'react';
import { Room } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data - in production, this would come from a data store
const placeholderRooms: Room[] = [
  {
    id: 'room-living-1',
    householdId: 'household-1',
    name: 'Living Room',
    area: 'Living Room',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-kitchen-1',
    householdId: 'household-1',
    name: 'Kitchen',
    area: 'Kitchen',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-master-1',
    householdId: 'household-1',
    name: 'Master Bedroom',
    area: 'Bedroom',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-ethan-1',
    householdId: 'household-1',
    name: "Ethan's Room",
    area: 'Bedroom',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-emma-1',
    householdId: 'household-1',
    name: "Emma's Room",
    area: 'Bedroom',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const ROOM_TYPES = [
  'Bedroom',
  'Kitchen',
  'Living Room',
  'Bathroom',
  'Dining Room',
  'Office',
  'Garage',
  'Basement',
  'Attic',
  'Other',
];

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>(placeholderRooms);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', roomType: '' });

  const handleEdit = (room: Room) => {
    setEditingId(room.id);
    setFormData({
      name: room.name,
      roomType: room.area || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      // Update existing room
      setRooms(rooms.map(r => 
        r.id === editingId 
          ? {
              ...r,
              name: formData.name.trim(),
              area: formData.roomType || undefined,
              updatedAt: new Date().toISOString(),
            }
          : r
      ));
      setEditingId(null);
    } else {
      // Create new room
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        householdId: 'household-1',
        name: formData.name.trim(),
        area: formData.roomType || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRooms([...rooms, newRoom]);
    }

    setFormData({ name: '', roomType: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', roomType: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="page">
      <OrientationHeader 
        title="Rooms & Areas" 
        description="Manage rooms and areas in your home" 
      />

      <NowNext 
        now="Keep track of the rooms and spaces in your home"
        next="Add rooms to organize your household"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', roomType: '' });
            }
          }}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Room'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="room-name" className="entity-form__label">
              Room Name
            </label>
            <input
              id="room-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="entity-form__input"
              placeholder="Living Room, Kitchen, Bedroom..."
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="room-type" className="entity-form__label">
              Room Type (optional)
            </label>
            <select
              id="room-type"
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              className="entity-form__input"
            >
              <option value="">Select a type...</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
        {rooms.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">🚪</div>
            <h2 className="entity-list__empty-title">Add your rooms</h2>
            <p className="entity-list__empty-description">
              Keep track of the rooms and spaces in your home. Add each room by name and type to organize your household.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Room
            </button>
          </div>
        ) : rooms.length > 0 ? (
          <div className="entity-list__list">
            {rooms.map((room) => {
              // Get related documents for this room (would come from data store in production)
              const roomDocuments: any[] = []; // Placeholder - would filter documents by linkedToRoomId
              
              return (
                <div key={room.id} className="entity-list__item">
                  <div className="entity-list__item-content">
                    <h3 className="entity-list__item-title">{room.name}</h3>
                    {room.area && (
                      <p className="entity-list__item-description">Type: {room.area}</p>
                    )}
                    {roomDocuments.length > 0 && (
                      <p className="entity-list__item-description" style={{ marginTop: 'var(--spacing-xs)', fontStyle: 'italic', color: 'var(--color-gray-500)' }}>
                        {roomDocuments.length} document{roomDocuments.length !== 1 ? 's' : ''} stored here
                      </p>
                    )}
                  </div>
                  <div className="entity-list__item-actions">
                    <button
                      onClick={() => handleEdit(room)}
                      className="entity-list__edit-button"
                      aria-label="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="entity-list__delete-button"
                      aria-label="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
