/**
 * Assets Page
 * List and manage home assets and belongings
 */

import { useState } from 'react';
import { Asset } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data - in production, this would come from a data store
const placeholderAssets: Asset[] = [
  {
    id: 'asset-washing-machine-1',
    householdId: 'household-1',
    name: 'Washing Machine',
    category: 'Appliance',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asset-refrigerator-1',
    householdId: 'household-1',
    name: 'Refrigerator',
    category: 'Appliance',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asset-sofa-1',
    householdId: 'household-1',
    name: 'Living Room Sofa',
    category: 'Furniture',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asset-dining-table-1',
    householdId: 'household-1',
    name: 'Dining Table',
    category: 'Furniture',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const ASSET_CATEGORIES = ['Appliance', 'Furniture', 'Other'];

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>(placeholderAssets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '' });

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setFormData({
      name: asset.name,
      category: asset.category || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      // Update existing asset
      setAssets(assets.map(a => 
        a.id === editingId 
          ? {
              ...a,
              name: formData.name.trim(),
              category: formData.category || undefined,
              updatedAt: new Date().toISOString(),
            }
          : a
      ));
      setEditingId(null);
    } else {
      // Create new asset
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        householdId: 'household-1',
        name: formData.name.trim(),
        category: formData.category || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAssets([...assets, newAsset]);
    }

    setFormData({ name: '', category: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', category: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="page">
      <OrientationHeader 
        title="Assets" 
        description="Manage home assets and belongings" 
      />

      <NowNext 
        now="Keep an inventory of important items in your home"
        next="Add belongings to track what you own"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', category: '' });
            }
          }}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Asset'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="asset-name" className="entity-form__label">
              Name
            </label>
            <input
              id="asset-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="entity-form__input"
              placeholder="TV, Refrigerator, Sofa..."
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="asset-category" className="entity-form__label">
              Category (optional)
            </label>
            <select
              id="asset-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="entity-form__input"
            >
              <option value="">Select a category...</option>
              {ASSET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
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
        {assets.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">📦</div>
            <h2 className="entity-list__empty-title">Add your belongings</h2>
            <p className="entity-list__empty-description">
              Keep track of important items in your home. Add appliances, furniture, and other belongings to maintain an inventory of what you own.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Asset
            </button>
          </div>
        ) : assets.length > 0 ? (
          <div className="entity-list__list">
            {assets.map((asset) => (
              <div key={asset.id} className="entity-list__item">
                <div className="entity-list__item-content">
                  <h3 className="entity-list__item-title">{asset.name}</h3>
                  {asset.category && (
                    <p className="entity-list__item-description">Category: {asset.category}</p>
                  )}
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="entity-list__edit-button"
                    aria-label="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
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
