# Recipe Discovery Enhancement - Testing Guide

## Quick Test (5 minutes)

### Test 1: Cuisine Categories
1. Go to `http://localhost:3000/kitchen/recipes`
2. Look for cuisine filter pills (below meal type filters)
3. Click "Italian" cuisine filter
4. **Expected**: Only Italian recipes show
5. Click "Asian" cuisine filter
6. **Expected**: Only Asian recipes show
7. Click "All Cuisines"
8. **Expected**: All recipes return

✅ **Pass if**: Cuisine filters work, recipes filter correctly

---

### Test 2: Discover Mode (Swipe)
1. On Recipe Library page
2. Click "Discover Mode" button (purple)
3. **Expected**: View changes to single large card
4. **Expected**: Shows progress "1 of X recipes"
5. **On Mobile**: Swipe left → next recipe
6. **On Mobile**: Swipe right → saves to favorites
7. **On Desktop**: Click "Skip" button → next recipe
8. **On Desktop**: Click "Like" button → saves to favorites
9. Continue until end
10. **Expected**: Alert "You've browsed all recipes!"
11. **Expected**: Returns to grid view

✅ **Pass if**: Discover mode works, swipe detected, recipes advance

---

### Test 3: Liked Recipes / Favorites
1. In grid or discover mode, like 3-5 recipes
2. Click the heart filter button (top-right)
3. **Expected**: Only liked recipes show
4. **Expected**: Heart badge visible on liked cards (grid view)
5. **Expected**: Count shows in filter button
6. Refresh page
7. **Expected**: Liked recipes still saved

✅ **Pass if**: Favorites system works, persists correctly

---

### Test 4: Filter Combinations
1. Set meal type filter: "Dinner"
2. Set cuisine filter: "Italian"
3. **Expected**: Only Italian dinners show
4. Type in search: "pasta"
5. **Expected**: Only Italian dinner pasta recipes
6. Click heart filter
7. **Expected**: Only liked Italian dinner pasta recipes

✅ **Pass if**: All filters combine correctly

---

### Test 5: Actions from Recipe Detail
1. Open any recipe (click card in grid view)
2. In modal, click "Save to Favorites"
3. **Expected**: Heart fills pink, text changes to "Saved to Favorites"
4. Click "Add Ingredients to Shopping"
5. **Expected**: Confirmation prompt
6. Confirm
7. **Expected**: Success alert, ingredients added
8. Click "Close"
9. **Expected**: Modal closes, back to library

✅ **Pass if**: All actions work, modal doesn't navigate away

---

## Detailed Feature Testing

### Cuisine Category System

**Available Cuisines** (dynamically extracted):
- Italian
- American
- Asian
- Mexican
- French
- Mediterranean
- And more...

**Test Matrix**:
| Cuisine | Expected Recipes | Test Result |
|---------|------------------|-------------|
| Italian | Pasta, Pizza, etc. | ☐ Pass ☐ Fail |
| Asian | Stir-fry, Sushi, etc. | ☐ Pass ☐ Fail |
| Mexican | Tacos, Burritos, etc. | ☐ Pass ☐ Fail |

**Visual Checks**:
- [ ] Cuisine pills scroll horizontally
- [ ] Selected cuisine has purple background
- [ ] Unselected have white background
- [ ] Hover effects work
- [ ] Readable font size

---

### Discover Mode (Swipe Feature)

**Card Layout**:
- [ ] Single card centered (max-w-md)
- [ ] Large image fills width
- [ ] Recipe title is 2xl, bold
- [ ] Description readable
- [ ] Time, servings, difficulty show
- [ ] Progress indicator at top

**Swipe Interaction (Mobile)**:
- [ ] Touch start detected
- [ ] Touch move tracked
- [ ] Swipe left (>50px) triggers skip
- [ ] Swipe right (>50px) triggers like
- [ ] Next recipe loads immediately
- [ ] No lag or glitches

**Button Interaction (Desktop)**:
- [ ] "Skip" button (gray) advances
- [ ] "Like" button (pink) saves + advances
- [ ] Buttons have hover effects
- [ ] Icons display correctly
- [ ] Text updates if already liked

**Progress & Navigation**:
- [ ] Progress shows current position
- [ ] "X of Y recipes" updates
- [ ] End of list shows alert
- [ ] Auto-returns to grid view
- [ ] Swipe instruction text visible

---

### Liked Recipes System

**Save Functionality**:
- [ ] Heart button in grid view
- [ ] Heart button in discover mode
- [ ] Heart button in detail modal
- [ ] Click toggles like/unlike
- [ ] Visual feedback immediate
- [ ] localStorage updates

**Visual Indicators**:
- [ ] Pink heart badge (top-right) in grid
- [ ] Heart fills solid when liked
- [ ] Heart outline when not liked
- [ ] Badge visible but not intrusive

**Filter Button**:
- [ ] Heart icon in top toggle area
- [ ] Shows count when > 0
- [ ] Click filters to liked only
- [ ] Click again shows all
- [ ] Pink when active

**Persistence**:
- [ ] Liked recipes save to localStorage
- [ ] Key: `likedRecipes`
- [ ] Format: Array of IDs
- [ ] Survives page refresh
- [ ] Works across sessions

---

### Filter System Integration

**Test Filter Combinations**:

1. **Meal Type Only**:
   - Select: Breakfast
   - Expected: All breakfast recipes

2. **Cuisine Only**:
   - Select: Italian
   - Expected: All Italian recipes (any meal type)

3. **Meal Type + Cuisine**:
   - Select: Dinner + Italian
   - Expected: Italian dinner recipes only

4. **Meal Type + Cuisine + Search**:
   - Select: Dinner + Italian
   - Search: "chicken"
   - Expected: Italian dinner chicken recipes

5. **Meal Type + Cuisine + Liked**:
   - Select: Dinner + Asian
   - Click heart filter
   - Expected: Only liked Asian dinner recipes

6. **All Filters + Discover Mode**:
   - Apply any filters
   - Switch to Discover Mode
   - Expected: Swipe through filtered subset only

---

### Action Button Testing

**From Grid View**:
- [ ] Click recipe card opens modal
- [ ] Modal shows full details
- [ ] All action buttons present

**From Discover Mode**:
- [ ] "View Full Recipe" opens modal
- [ ] Modal shows same details
- [ ] Actions work identically

**Action: Save to Favorites**:
- [ ] Button shows current state
- [ ] Click toggles state
- [ ] Icon fills when liked
- [ ] Text updates dynamically
- [ ] No page refresh needed

**Action: Add to Shopping**:
- [ ] Shows confirmation prompt
- [ ] Prompt shows ingredient count
- [ ] Confirm adds to shopping list
- [ ] Cancel does nothing
- [ ] Success alert appears

**Action: Add to Meal Plan**:
- [ ] Shows "Coming soon" message
- [ ] Doesn't break or error
- [ ] Modal stays open
- [ ] Placeholder for future feature

---

## Visual Verification

### Layout Structure
```
Recipe Library Page
├── Header (title, back link)
├── Search bar (local, scoped)
├── View mode toggle (Grid / Discover / Favorites)
├── Meal type filter (orange pills)
├── Cuisine filter (purple pills)
├── Results count
└── Content (Grid or Discover card)
```

### Color Consistency
- **Orange**: Meal type filters, primary actions
- **Purple**: Cuisine filters, discover mode
- **Pink**: Liked/favorites, heart icons
- **Blue**: Shopping list actions
- **Gray**: Skip, secondary actions

### Responsive Design
- [ ] Filters scroll horizontally on mobile
- [ ] Grid adapts: 1 col (mobile) → 3 cols (desktop)
- [ ] Discover card centered on all screens
- [ ] Touch events work on mobile
- [ ] Buttons work on desktop

---

## Edge Cases

### Empty States

**No Liked Recipes**:
- Heart filter button shows (0)
- Clicking shows empty message
- Can return to all recipes

**No Recipes Match Filters**:
- "No recipes found" message
- Suggestion to change filters
- Search remains functional

**End of Discover Mode**:
- Alert: "You've browsed all recipes!"
- Auto-return to grid view
- Index resets to 0

### Swipe Edge Cases

**Very Short Swipe** (<50px):
- No action triggered
- Card stays on current recipe

**Swipe on Non-Touch Device**:
- Buttons provide same functionality
- No broken touch handlers

**Fast Consecutive Swipes**:
- Each swipe handled correctly
- No skipped recipes
- State updates properly

---

## Performance Checks

- [ ] Filters apply instantly (<100ms)
- [ ] No lag when switching modes
- [ ] Images load progressively
- [ ] Swipe feels responsive
- [ ] No memory leaks
- [ ] localStorage access efficient

---

## Data Verification

### localStorage Keys
- `likedRecipes`: Array of recipe IDs
- `weeklyMeals`: Array of planned meals
- `shoppingItems`: Array of shopping items

**Check**:
```javascript
// In browser console:
localStorage.getItem('likedRecipes')
// Should return: ["dinner-001", "breakfast-003", ...]
```

### Recipe Data Integrity
- [ ] All recipes have cuisine property
- [ ] Cuisines extracted correctly
- [ ] No duplicate cuisines
- [ ] Count matches actual recipes

---

## Integration Testing

### With Shopping List
1. Like a recipe
2. Open recipe detail
3. Add ingredients to shopping
4. Navigate to Shopping List
5. Verify ingredients added
6. Verify category is "recipe-ingredients"

### With Meal Planner
1. From "Swap Recipe" in Meal Day View
2. Should navigate to Recipe Library
3. URL includes `?filter=[mealType]&swap=true`
4. (Future: Select recipe to replace)

### With Global Search
1. Search for recipe from any page
2. Click recipe result
3. Modal opens with full details
4. All actions available
5. Cuisine shows in search result

---

## Comparison: Before vs After

### Before
- ❌ Only meal type filters (breakfast/lunch/dinner)
- ❌ No cuisine browsing
- ❌ Broken swipe behavior
- ❌ No favorites system
- ❌ Limited discovery options
- ❌ Single view mode

### After
- ✅ Meal type + cuisine filters
- ✅ Cuisine categories extracted dynamically
- ✅ Intentional swipe (like/skip)
- ✅ Full favorites system
- ✅ Discover Mode for exploration
- ✅ Two view modes (Grid + Discover)
- ✅ Liked recipes persist
- ✅ Enhanced action buttons

---

## User Scenarios

### Scenario 1: Explore Italian Recipes
```
1. Click "Italian" cuisine
2. Browse 8-10 Italian recipes
3. Like 2-3 favorites
4. Open one recipe
5. Add ingredients to shopping
6. Plan to cook this week
```

### Scenario 2: Discover New Recipes
```
1. Click "Discover Mode"
2. Swipe through recipes
3. Like interesting ones
4. Skip others
5. End of list
6. Return to grid
7. Click heart filter to see liked
```

### Scenario 3: Quick Meal Planning
```
1. Filter: Dinner + Asian
2. Browse 4-5 options
3. Like one
4. Open recipe detail
5. Add to shopping list
6. (Future: Add to Monday dinner)
```

---

## Success Indicators

✅ **Feature Complete If**:
- All 5 quick tests pass
- No console errors
- Filters combine correctly
- Swipe works on mobile
- Favorites persist
- Actions execute properly

✅ **User Experience Good If**:
- Discovery feels fun
- Filters are intuitive
- Navigation is clear
- Actions have value
- Performance is smooth

🎯 **Production Ready If**:
- All tests pass
- No linting errors
- Documentation complete
- Mobile tested
- Integration verified

---

## Automated Checks

```bash
# Check TypeScript compilation
npm run build

# Run linter
npm run lint

# Test localStorage
# Browser console:
localStorage.getItem('likedRecipes')
localStorage.getItem('weeklyMeals')
```

---

## Report Template

**Date Tested**: ___________
**Tester**: ___________
**Device**: Mobile / Desktop / Both

| Feature | Pass | Fail | Notes |
|---------|------|------|-------|
| Cuisine categories display | ☐ | ☐ | |
| Cuisine filtering works | ☐ | ☐ | |
| Discover Mode loads | ☐ | ☐ | |
| Swipe left (skip) works | ☐ | ☐ | |
| Swipe right (like) works | ☐ | ☐ | |
| Like button saves | ☐ | ☐ | |
| Favorites filter works | ☐ | ☐ | |
| Liked badge shows | ☐ | ☐ | |
| Add to shopping works | ☐ | ☐ | |
| Filter combinations work | ☐ | ☐ | |
| Persistence works | ☐ | ☐ | |
| No navigation issues | ☐ | ☐ | |

**Overall Result**: Pass ☐ / Fail ☐
**Comments**: ________________________________

---

*Testing Guide Version: 2.0*
*Last Updated: 2026-01-19*
*New Features: Cuisine categories, Discover Mode, Favorites*
