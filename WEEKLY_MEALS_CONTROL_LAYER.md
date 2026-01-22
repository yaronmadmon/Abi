# "This Week's Meals" - Weekly Execution Control Layer

## Core Philosophy

**"This Week's Meals" is NOT a recipe viewer.**  
**It IS a weekly planning and execution control layer.**

---

## Problem Solved

### Before (❌ Bad Pattern)
- Clicking a meal opened a floating recipe modal
- Modal duplicated Recipe Library behavior
- Modal trapped navigation (no clear back)
- Modal didn't fit screen properly
- Section had no actionable value
- Just showed recipes, didn't help cook them

### After (✅ Correct Pattern)
- Clicking a meal opens a dedicated **Meal Day View** (full page)
- Shows meal context + readiness + actions
- Clear navigation (always back to Kitchen)
- Focused on DOING, not just viewing
- Empowers meal execution and management

---

## Architecture

### Role Separation

```
Recipe Library         →  Browse, discover, view full recipes
This Week's Meals      →  Plan, prepare, execute scheduled meals
Meal Day View          →  Action layer for one meal on one day
```

**No overlap. No duplication. Clear purpose.**

---

## Components

### 1. Kitchen Page - "This Week's Meals" Section

**Purpose**: Weekly calendar overview

**Interaction**:
- Click a day card → Navigate to `/kitchen/day/[date]`
- Shows meal count per day
- Color-coded by meal presence
- "Clear All" button to reset week

**What it does NOT do**:
- Does NOT show recipe details
- Does NOT open modals
- Does NOT display ingredients/instructions

### 2. Meal Day View Page (`/kitchen/day/[date]`)

**Purpose**: Action-oriented meal management for one specific day

**URL Pattern**: `/kitchen/day/2026-01-19`

**Content Structure**:

#### A) Meal Context
- Day name (e.g., "Monday, January 19")
- Meal type badge (Breakfast/Lunch/Dinner/Baking)
- Recipe name (clickable → opens full recipe in Recipe Library)
- Recipe image (visual reference)
- Prep time, servings

#### B) Readiness Information
- **Ingredients Check**:
  - Shows total ingredient count
  - Placeholder for pantry integration (coming soon)
  - Quick preview of key ingredients (first 6)
- **Cooked Status**:
  - Visual indicator if meal already cooked
  - Quick toggle in header

#### C) Actions (Core Value)
1. **Add to Shopping List**
   - Adds all ingredients
   - Confirmation prompt
   - One-click convenience

2. **Swap Recipe**
   - Opens Recipe Library filtered by meal type
   - Easy to replace with different recipe
   - Maintains meal slot in plan

3. **Mark as Cooked**
   - Toggle cooked/uncooked status
   - Visual feedback (checkmark badge)
   - Helps track progress through week

4. **Remove from Plan**
   - Deletes meal from schedule
   - Confirmation required
   - Returns to Kitchen if last meal

#### D) Navigation
- Clear "Back to Kitchen" link at top
- No trapped states
- No floating modals
- Predictable, reversible flow

---

## Data Flow

### View Meal Details
```
Kitchen Page
    ↓ Click day card
Meal Day View (/kitchen/day/[date])
    ↓ Click recipe title
Recipe Library Detail (full recipe page)
    ↓ Back navigation
Meal Day View
    ↓ Back navigation
Kitchen Page
```

### Execute Action
```
Meal Day View
    ↓ Click "Add to Shopping"
Confirmation prompt
    ↓ Confirm
API call to /api/shopping/add
    ↓ Success
Shopping list updated
```

### Swap Recipe
```
Meal Day View
    ↓ Click "Swap Recipe"
Recipe Library (filtered by meal type)
    ↓ Select new recipe
(Future: Auto-replace in plan)
```

---

## Key Features

### 1. Cooked Tracking
- Toggle "cooked" status per meal
- Visual indicator (checkmark badge)
- Persists to localStorage
- Helps track weekly progress

### 2. Ingredient Management
- Preview key ingredients
- One-click add all to shopping list
- Pantry check placeholder (future integration)

### 3. Recipe Swapping
- Navigate to Recipe Library
- Filtered by meal type automatically
- Easy to find replacement recipes

### 4. Clear Navigation
- Breadcrumb-style back links
- No modal traps
- Full-page views only
- Predictable flow

---

## Visual Design

### Meal Type Colors
- **Breakfast**: Yellow to Orange gradient (`from-yellow-500 to-orange-500`)
- **Lunch**: Green to Emerald gradient (`from-green-500 to-emerald-500`)
- **Dinner**: Blue to Indigo gradient (`from-blue-500 to-indigo-500`)
- **Baking**: Pink to Rose gradient (`from-pink-500 to-rose-500`)

### Card Structure
- Colored header with meal type
- Large recipe image (132x132px)
- Clickable recipe title with hover icon
- Readiness check section (blue background)
- Quick ingredient preview (chips)
- Action button grid (2 columns)

### Action Buttons
- **Primary (Add to Shopping)**: Blue gradient, prominent
- **Secondary (Swap)**: White with border, hover effects
- **Danger (Remove)**: White with red text, confirmation required

---

## Technical Implementation

### Files Created
1. `app/kitchen/day/[date]/page.tsx` - Meal Day View component

### Files Modified
1. `app/kitchen/page.tsx` - Removed modal, added navigation

### Key Functions

**Meal Day View**:
```typescript
handleAddMissingToShopping(meal)  // Add ingredients to shopping
handleMarkAsCooked(mealId)         // Toggle cooked status
handleRemoveMeal(mealId)           // Delete from plan
handleSwapRecipe(mealType)         // Navigate to Recipe Library
```

**Kitchen Page**:
```typescript
handleDayClick(dayDate)            // Navigate to Meal Day View
handleClearAllMeals()              // Clear entire week
```

---

## User Flows

### Flow 1: Check Today's Meal
1. Open Kitchen page
2. Click today's day card
3. View Meal Day View
4. See what's planned
5. Mark as cooked when done

### Flow 2: Add Ingredients to Shopping
1. Open Meal Day View for a day
2. Review ingredients preview
3. Click "Add to Shopping"
4. Confirm addition
5. Navigate to Shopping List to review

### Flow 3: Swap a Recipe
1. Open Meal Day View
2. Decide to change recipe
3. Click "Swap Recipe"
4. Recipe Library opens (filtered)
5. Browse and select new recipe
6. (Future: Auto-replace in plan)

### Flow 4: View Full Recipe
1. Open Meal Day View
2. Click recipe title (with book icon)
3. Full Recipe Detail page opens
4. View ingredients and instructions
5. Back to Meal Day View

---

## What Makes This Work

### Clear Separation of Concerns
- **Recipe Library** = Recipe content (ingredients, instructions, images)
- **Meal Day View** = Meal management (actions, status, readiness)
- **Kitchen Page** = Weekly overview (calendar, summary)

### No Duplication
- Recipe details live ONLY in Recipe Library
- Meal Day View shows context + actions, not full recipe
- If user needs recipe, they click through to Recipe Library

### Action-Oriented
- Every button has clear purpose
- Immediate value (add to shopping, swap, mark cooked)
- Not just "view-only" display

### Clean Navigation
- Always know where you are
- Always know how to go back
- No modal traps or dead ends

---

## Future Enhancements

### Pantry Integration
- Show which ingredients user already has
- Highlight missing ingredients
- Smart shopping list (only missing items)

### Recipe Replacement
- Direct "swap" functionality from Meal Day View
- Replace meal in plan without leaving page
- Maintain all scheduling

### Nutrition Tracking
- Show calories per meal
- Daily/weekly totals
- Dietary preferences

### Scheduling Controls
- Drag-and-drop to reschedule
- Copy meal to another day
- Repeat favorite meals

---

## Success Criteria

✅ **Navigation is clear**:
- No trapped modals
- Always know how to go back
- Full-page views only

✅ **Actions are valuable**:
- Add to shopping (immediate utility)
- Swap recipe (easy adjustment)
- Mark cooked (progress tracking)
- Remove meal (plan management)

✅ **Purpose is distinct**:
- Meal Day View ≠ Recipe Library
- This Week's Meals = execution layer
- Recipe Library = content layer

✅ **User can**:
- View weekly schedule (Kitchen page)
- Manage individual meals (Meal Day View)
- Access full recipes (Recipe Library)
- Execute cooking workflow smoothly

---

## Anti-Patterns Avoided

❌ **Floating recipe modals** - Used full-page views instead
❌ **Duplicate recipe viewers** - Single recipe detail page
❌ **Trapped navigation** - Clear back buttons everywhere
❌ **View-only calendar** - Added actionable controls
❌ **Mixed purposes** - Strict role separation

---

## Testing Checklist

### Kitchen Page
- [ ] Click day card navigates to `/kitchen/day/[date]`
- [ ] "Clear All" button works
- [ ] No modal opens
- [ ] Day cards show meal counts

### Meal Day View
- [ ] Displays correct meals for date
- [ ] Recipe title links to Recipe Library
- [ ] "Add to Shopping" adds ingredients
- [ ] "Mark as Cooked" toggles status
- [ ] "Swap Recipe" navigates correctly
- [ ] "Remove from Plan" deletes meal
- [ ] Back button returns to Kitchen

### Integration
- [ ] Navigation flow is clear
- [ ] No dead ends or traps
- [ ] Actions persist correctly
- [ ] Events trigger updates across components

---

*Implementation Complete: 2026-01-19*
*Version: 1.0 - Weekly Execution Control Layer*
