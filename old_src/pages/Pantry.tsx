/**
 * Pantry Page
 * Low-effort ingredient tracking
 */

import { useState } from 'react';
import { PantryItem, PantryLocation } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data
const placeholderPantryItems: PantryItem[] = [];

export function Pantry() {
  const [items, setItems] = useState<PantryItem[]>(placeholderPantryItems);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: PantryLocation.PANTRY,
    isRunningLow: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newItem: PantryItem = {
      id: `pantry-${Date.now()}`,
      householdId: 'household-1',
      name: formData.name.trim(),
      location: formData.location,
      isRunningLow: formData.isRunningLow,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    setFormData({ name: '', location: PantryLocation.PANTRY, isRunningLow: false });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleToggleRunningLow = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isRunningLow: !item.isRunningLow } : item
    ));
  };

  return (
    <div className="page">
      <OrientationHeader
        title="Pantry"
        description="What you have on hand"
      />

      <NowNext
        now="Keep track of what's in your kitchen"
        next="Add items as you remember them"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => setShowForm(!showForm)}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="pantry-name" className="entity-form__label">
              Item Name
            </label>
            <input
              id="pantry-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="entity-form__input"
              placeholder="e.g., olive oil, flour, milk"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="pantry-location" className="entity-form__label">
              Location
            </label>
            <select
              id="pantry-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as PantryLocation })}
              className="entity-form__select"
            >
              <option value={PantryLocation.PANTRY}>Pantry</option>
              <option value={PantryLocation.FRIDGE}>Fridge</option>
              <option value={PantryLocation.FREEZER}>Freezer</option>
            </select>
          </div>

          <div className="entity-form__field">
            <label className="entity-form__label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.isRunningLow}
                onChange={(e) => setFormData({ ...formData, isRunningLow: e.target.checked })}
                style={{ width: 'auto' }}
              />
              Running low
            </label>
          </div>

          <div className="entity-form__actions">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: '', location: PantryLocation.PANTRY, isRunningLow: false });
              }}
              className="entity-form__button entity-form__button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="entity-form__button entity-form__button--submit"
            >
              Add Item
            </button>
          </div>
        </form>
      )}

      <div className="entity-list__content">
        {items.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">🥫</div>
            <h2 className="entity-list__empty-title">Add pantry items</h2>
            <p className="entity-list__empty-description">
              Keep track of what you have. Mark items as running low when you notice.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Item
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="entity-list__list">
            {items.map((item) => (
              <div key={item.id} className="entity-list__item">
                <div className="entity-list__item-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={item.isRunningLow}
                      onChange={() => handleToggleRunningLow(item.id)}
                      style={{ width: 'auto' }}
                    />
                    <h3 className="entity-list__item-title">{item.name}</h3>
                  </div>
                  <p className="entity-list__item-description">
                    {item.location.charAt(0).toUpperCase() + item.location.slice(1)}
                  </p>
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="entity-list__delete-button"
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
