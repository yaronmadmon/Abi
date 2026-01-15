/**
 * Recipes Page
 * Family-centered recipe management
 */

import { useState } from 'react';
import { Recipe } from '@/models';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './EntityList.css';

// Placeholder data
const placeholderRecipes: Recipe[] = [];

export function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(placeholderRecipes);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    instructions: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      householdId: 'household-1',
      name: formData.name.trim(),
      ingredients: formData.ingredients.trim(),
      instructions: formData.instructions.trim(),
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecipes([...recipes, newRecipe]);
    setFormData({ name: '', ingredients: '', instructions: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  return (
    <div className="page">
      <OrientationHeader
        title="Recipes"
        description="Your family cookbook"
      />

      <NowNext
        now="Keep your favorite recipes close at hand"
        next="Add a recipe to get started"
      />

      <div className="entity-list__toolbar">
        <button
          onClick={() => setShowForm(!showForm)}
          className="entity-list__add-button"
        >
          {showForm ? 'Cancel' : '+ Add Recipe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="entity-form__field">
            <label htmlFor="recipe-name" className="entity-form__label">
              Recipe Name
            </label>
            <input
              id="recipe-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="entity-form__input"
              placeholder="Recipe name"
              required
              autoFocus
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="recipe-ingredients" className="entity-form__label">
              Ingredients
            </label>
            <textarea
              id="recipe-ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="entity-form__textarea"
              placeholder="List your ingredients..."
              rows={5}
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="recipe-instructions" className="entity-form__label">
              Instructions
            </label>
            <textarea
              id="recipe-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="entity-form__textarea"
              placeholder="How to make it..."
              rows={6}
            />
          </div>

          <div className="entity-form__field">
            <label htmlFor="recipe-notes" className="entity-form__label">
              Notes (optional)
            </label>
            <textarea
              id="recipe-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="entity-form__textarea"
              placeholder="e.g., 'kids love this', 'good for guests'"
              rows={3}
            />
          </div>

          <div className="entity-form__actions">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: '', ingredients: '', instructions: '', notes: '' });
              }}
              className="entity-form__button entity-form__button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="entity-form__button entity-form__button--submit"
            >
              Add Recipe
            </button>
          </div>
        </form>
      )}

      <div className="entity-list__content">
        {recipes.length === 0 && !showForm ? (
          <div className="entity-list__empty">
            <div className="entity-list__empty-icon">📖</div>
            <h2 className="entity-list__empty-title">Add your recipes</h2>
            <p className="entity-list__empty-description">
              Build your family cookbook. Add recipes with ingredients, instructions, and notes.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="entity-list__add-button"
            >
              + Add Recipe
            </button>
          </div>
        ) : recipes.length > 0 ? (
          <div className="entity-list__list">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="entity-list__item">
                <div className="entity-list__item-content">
                  <h3 className="entity-list__item-title">{recipe.name}</h3>
                  {recipe.notes && (
                    <p className="entity-list__item-description">{recipe.notes}</p>
                  )}
                </div>
                <div className="entity-list__item-actions">
                  <button
                    onClick={() => handleDelete(recipe.id)}
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
