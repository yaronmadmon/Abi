/**
 * Grocery List Page
 * AI-powered, human-controlled shopping list
 */

import { useState } from 'react';
import { GroceryListItem } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data
const placeholderGroceryItems: GroceryListItem[] = [];

export function GroceryList() {
  const [items, setItems] = useState<GroceryListItem[]>(placeholderGroceryItems);
  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryListItem = {
      id: `grocery-${Date.now()}`,
      householdId: 'household-1',
      name: newItemName.trim(),
      isChecked: false,
      addedFrom: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setShowForm(false);
  };

  const handleToggleChecked = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const checkedItems = items.filter(i => i.isChecked);
  const uncheckedItems = items.filter(i => !i.isChecked);

  return (
    <div className="page">
      <OrientationHeader
        title="Grocery List"
        description="Shopping made simple"
      />

      <NowNext
        now="Your shopping list, ready when you are"
        next="Add items as you think of them"
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
        <form onSubmit={handleAddItem} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="grocery-name" className="entity-form__label">
              Item Name
            </label>
            <input
              id="grocery-name"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="entity-form__input"
              placeholder="What do you need?"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__actions">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewItemName('');
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
            <div className="entity-list__empty-icon">🛒</div>
            <h2 className="entity-list__empty-title">Start your grocery list</h2>
            <p className="entity-list__empty-description">
              Add items as you think of them. Check them off as you shop.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Item
            </button>
          </div>
        ) : (
          <>
            {uncheckedItems.length > 0 && (
              <div className="entity-list__list">
                {uncheckedItems.map((item) => (
                  <div key={item.id} className="entity-list__item">
                    <div className="entity-list__item-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => handleToggleChecked(item.id)}
                        style={{ width: 'auto' }}
                      />
                      <h3 className="entity-list__item-title" style={{ margin: 0, textDecoration: 'none' }}>
                        {item.name}
                      </h3>
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
            )}

            {checkedItems.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-gray-500)', marginBottom: '12px' }}>
                  Completed
                </h3>
                <div className="entity-list__list">
                  {checkedItems.map((item) => (
                    <div key={item.id} className="entity-list__item" style={{ opacity: 0.6 }}>
                      <div className="entity-list__item-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={item.isChecked}
                          onChange={() => handleToggleChecked(item.id)}
                          style={{ width: 'auto' }}
                        />
                        <h3 className="entity-list__item-title" style={{ margin: 0, textDecoration: 'line-through' }}>
                          {item.name}
                        </h3>
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
