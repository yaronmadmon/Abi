/**
 * Kitchen Notes Page
 * Cooking wisdom and reminders
 */

import { useState } from 'react';
import { KitchenNote } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data
const placeholderNotes: KitchenNote[] = [];

export function KitchenNotes() {
  const [notes, setNotes] = useState<KitchenNote[]>(placeholderNotes);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const newNote: KitchenNote = {
      id: `kitchen-note-${Date.now()}`,
      householdId: 'household-1',
      title: formData.title.trim(),
      content: formData.content.trim(),
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([...notes, newNote]);
    setFormData({ title: '', content: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="page">
      <OrientationHeader
        title="Kitchen Notes"
        description="Cooking wisdom and reminders"
      />

      <NowNext
        now="Capture tips, tricks, and kitchen knowledge"
        next="Add a note to remember something"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => setShowForm(!showForm)}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="note-title" className="entity-form__label">
              Title
            </label>
            <input
              id="note-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="entity-form__input"
              placeholder="Note title"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="note-content" className="entity-form__label">
              Content
            </label>
            <textarea
              id="note-content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="entity-form__textarea"
              placeholder="Your kitchen wisdom..."
              rows={8}
              required
            />
          </div>

          <div className="entity-form__actions">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', content: '' });
              }}
              className="entity-form__button entity-form__button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="entity-form__button entity-form__button--submit"
            >
              Add Note
            </button>
          </div>
        </form>
      )}

      <div className="entity-list__content">
        {notes.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">📝</div>
            <h2 className="entity-list__empty-title">Add kitchen notes</h2>
            <p className="entity-list__empty-description">
              Save tips, tricks, substitutions, or anything you want to remember in the kitchen.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Note
            </button>
          </div>
        ) : notes.length > 0 ? (
          <div className="entity-list__list">
            {notes.map((note) => (
              <div key={note.id} className="entity-list__item">
                <div className="entity-list__item-content">
                  <h3 className="entity-list__item-title">{note.title}</h3>
                  <p className="entity-list__item-description" style={{ whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={() => handleDelete(note.id)}
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
