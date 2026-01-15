/**
 * Kitchen Home
 * The heart of the home - warm, intuitive, gently intelligent
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import './Page.css';
import './KitchenHome.css';

export function KitchenHome() {
  const [mealIdea, setMealIdea] = useState<string | null>(null);

  // Placeholder for AI meal suggestion (invisible intelligence)
  // In future, this would be generated based on recipes, preferences, pantry items
  const suggestedMeal = mealIdea || null;

  const handleDismissMeal = () => {
    setMealIdea(null);
  };

  return (
    <div className="page">
      <OrientationHeader
        title="Kitchen"
        description="What's cooking today?"
      />

      <NowNext
        now="The heart of your home"
        next="Explore recipes, manage your pantry, or start a grocery list"
      />

      {/* Primary focus card - Today's meal idea (AI-assisted, optional) */}
      {suggestedMeal && (
        <div className="kitchen-home__meal-card">
          <div className="kitchen-home__meal-content">
            <h2 className="kitchen-home__meal-title">Today's meal idea</h2>
            <p className="kitchen-home__meal-suggestion">{suggestedMeal}</p>
          </div>
          <button
            onClick={handleDismissMeal}
            className="kitchen-home__meal-dismiss"
            aria-label="Dismiss suggestion"
          >
            ×
          </button>
        </div>
      )}

      {/* Secondary cards */}
      <div className="kitchen-home__cards">
        <Link to="/kitchen/recipes" className="kitchen-home__card">
          <div className="kitchen-home__card-icon">📖</div>
          <div className="kitchen-home__card-content">
            <h3 className="kitchen-home__card-title">Recipes</h3>
            <p className="kitchen-home__card-description">
              Your family cookbook
            </p>
          </div>
        </Link>

        <Link to="/kitchen/pantry" className="kitchen-home__card">
          <div className="kitchen-home__card-icon">🥫</div>
          <div className="kitchen-home__card-content">
            <h3 className="kitchen-home__card-title">Pantry</h3>
            <p className="kitchen-home__card-description">
              What you have on hand
            </p>
          </div>
        </Link>

        <Link to="/kitchen/grocery-list" className="kitchen-home__card">
          <div className="kitchen-home__card-icon">🛒</div>
          <div className="kitchen-home__card-content">
            <h3 className="kitchen-home__card-title">Grocery List</h3>
            <p className="kitchen-home__card-description">
              Shopping made simple
            </p>
          </div>
        </Link>

        <Link to="/kitchen/notes" className="kitchen-home__card">
          <div className="kitchen-home__card-icon">📝</div>
          <div className="kitchen-home__card-content">
            <h3 className="kitchen-home__card-title">Kitchen Notes</h3>
            <p className="kitchen-home__card-description">
              Cooking wisdom and reminders
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
