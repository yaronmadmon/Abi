# Recipe Library System - Testing Guide

## Quick Test Scenarios

### ✅ Scenario 1: Browse Recipe Library (2 minutes)

**Steps**:
1. Navigate to `http://localhost:3000/kitchen`
2. Look for the **purple "Recipe Library"** card (between Today's Meal and Meal Planner)
3. Click the Recipe Library card
4. You should see:
   - Page title: "Recipe Library"
   - Search bar: "Search recipes..."
   - Category filters: All Recipes, Breakfast, Lunch, Dinner, Baking
   - Grid of recipe cards with images

**Expected Results**:
- 25+ recipes display in a responsive grid
- Each card shows: image, meal type badge, title, description, time, servings
- Page loads fast, images display correctly

---

### ✅ Scenario 2: Local Recipe Search (1 minute)

**Steps**:
1. On Recipe Library page (`/kitchen/recipes`)
2. Type "chicken" in the search bar
3. Watch results filter instantly
4. Clear search with X button
5. Try searching "italian"

**Expected Results**:
- Results filter immediately as you type
- Only matching recipes appear
- Result count updates ("X recipes found")
- Clear button removes search, shows all recipes
- Page does NOT navigate away
- Search is scoped to recipes only

---

### ✅ Scenario 3: View Recipe Details (2 minutes)

**Steps**:
1. Click any recipe card from the library
2. Recipe Detail Modal should open showing:
   - Large hero image at top
   - Recipe title, meal type, cuisine, difficulty
   - Total time, servings, calories
   - Full ingredients list with quantities
   - Numbered step-by-step instructions
   - Tags
3. Scroll through the modal
4. Click X button or "Close" to dismiss

**Expected Results**:
- Modal opens smoothly over current page
- All recipe details are readable and formatted
- Modal scrolls if content is long
- Close button works
- Background page is dimmed

---

### ✅ Scenario 4: Add Ingredients to Shopping List (2 minutes)

**Steps**:
1. Open any recipe detail modal
2. Scroll to bottom
3. Click **"Add Ingredients to Shopping List"**
4. See confirmation alert ("Added X ingredients...")
5. Click OK
6. Navigate to Today page → Shopping card
7. Click Shopping card
8. Verify ingredients appear in shopping list

**Expected Results**:
- Alert shows correct ingredient count
- Ingredients added to shopping list under "recipe-ingredients" category
- Shopping list page shows new items
- Items are unchecked (not completed)
- No duplicate items if added twice

---

### ✅ Scenario 5: Global Search for Recipes (2 minutes)

**Steps**:
1. Navigate to any page (e.g., Today page)
2. Click the global search bar at top
3. Type "carbonara"
4. You should see search results with:
   - Purple chef hat icon
   - Recipe title: "Classic Spaghetti Carbonara"
   - Subtitle: "Italian • dinner"
   - Type label: "recipe"
5. Click the recipe result

**Expected Results**:
- Recipe appears in global search results
- Clicking opens Recipe Detail Modal immediately
- Modal shows full recipe (same as library view)
- Page does NOT navigate to /kitchen/recipes
- Modal overlays current page
- Can close modal and return to search

---

### ✅ Scenario 6: Category Filters (1 minute)

**Steps**:
1. Go to Recipe Library page
2. Click "Breakfast" category filter
3. Observe filtered results
4. Click "Dinner" category filter
5. Click "All Recipes" to reset

**Expected Results**:
- Only breakfast recipes show when "Breakfast" selected
- Only dinner recipes show when "Dinner" selected
- Recipe count updates for each category
- Selected category has orange background
- All recipes return when "All Recipes" clicked

---

### ✅ Scenario 7: Kitchen Page Integration (1 minute)

**Steps**:
1. Navigate to `/kitchen`
2. Observe the layout:
   - Today's Meal (blue card)
   - **Recipe Library (purple card)** ← NEW
   - Meal Planner (orange card)
   - This Week's Meals (grid)
   - Shopping List (summary)

**Expected Results**:
- Recipe Library card shows:
  - Purple gradient background
  - Book icon
  - Title: "Recipe Library"
  - Subtitle: "Browse 25+ recipes"
  - Recipe counts by meal type (Breakfast/Lunch/Dinner)
- Card is clickable and navigates to `/kitchen/recipes`

---

### ✅ Scenario 8: Navigation Flow (1 minute)

**Steps**:
1. Start at Kitchen page
2. Click Recipe Library card → goes to `/kitchen/recipes`
3. Click "← Back to Kitchen" → returns to Kitchen page
4. Use global search to find a recipe → opens modal
5. In modal, click "Browse More Recipes" → goes to `/kitchen/recipes`

**Expected Results**:
- Back button consistently returns to Kitchen
- All navigation is smooth and predictable
- Modal actions work correctly
- No broken links or 404 errors

---

## Visual Verification Checklist

### Recipe Cards
- [ ] Images load and display correctly
- [ ] Hover effect scales image slightly
- [ ] Meal type badge shows (breakfast/lunch/dinner/baking)
- [ ] Title is readable and truncates if too long
- [ ] Description shows 2 lines max
- [ ] Time and servings icons display
- [ ] Tags show (max 2 on card)

### Recipe Detail Modal
- [ ] Hero image fills width, maintains aspect ratio
- [ ] Close button (X) is visible in top-right
- [ ] Ingredients list is bulleted with orange dots
- [ ] Instructions are numbered with orange circles
- [ ] Action button is purple gradient
- [ ] Modal is centered and responsive
- [ ] Content scrolls smoothly

### Kitchen Page Card
- [ ] Purple gradient background
- [ ] Book icon displays
- [ ] Recipe counts are accurate
- [ ] Card hover effect works
- [ ] Arrow icon on right side

### Global Search
- [ ] Recipe results have purple chef hat icon
- [ ] "[Recipe]" label or meal type shows
- [ ] Results appear instantly as you type
- [ ] Recipe modal opens when clicked

---

## Data Verification

### Recipe Database
- [ ] 25+ recipes available
- [ ] Multiple breakfast options
- [ ] Multiple lunch options
- [ ] Multiple dinner options
- [ ] Multiple baking options
- [ ] Each recipe has:
  - [ ] Title, description
  - [ ] Image URL (Unsplash)
  - [ ] Ingredients with quantities
  - [ ] Step-by-step instructions
  - [ ] Cooking times
  - [ ] Servings, difficulty
  - [ ] Tags, cuisine

### Search Accuracy
- [ ] Searching "chicken" returns chicken recipes
- [ ] Searching "italian" returns Italian recipes
- [ ] Searching by tag works (e.g., "quick")
- [ ] Partial matches work (e.g., "carbo" finds "carbonara")
- [ ] Case-insensitive search works

---

## Performance Checks

- [ ] Recipe Library page loads in < 2 seconds
- [ ] Images load progressively
- [ ] Search filters instantly (< 100ms)
- [ ] Modal opens smoothly (< 500ms)
- [ ] No console errors
- [ ] No network errors
- [ ] Page scrolling is smooth
- [ ] Mobile responsive (test at 375px width)

---

## Edge Cases

### Empty Search
1. Search for "xyz123nonexistent"
2. Should show: "No recipes found" message
3. Should show: "Try a different search or category"

### Modal Interactions
1. Open recipe modal
2. Click outside modal → nothing happens (must use X or Close)
3. Press Escape key → nothing happens (must use buttons)
4. Scroll long recipe → modal scrolls, background doesn't

### Shopping List
1. Add same recipe ingredients twice
2. Should NOT create duplicates
3. Existing items should remain

---

## Mobile Testing (if available)

### Responsive Layouts
- [ ] Recipe grid becomes single column on mobile
- [ ] Category filters scroll horizontally
- [ ] Search bar is full width
- [ ] Recipe cards are touch-friendly
- [ ] Modal fits mobile viewport
- [ ] Images scale properly
- [ ] Text is readable at small sizes

### Touch Interactions
- [ ] Cards respond to tap
- [ ] Search input works with touch keyboard
- [ ] Modal scrolls with finger swipe
- [ ] Buttons have adequate touch targets (44x44px min)

---

## Integration Testing

### With Meal Planner
1. Go to Meal Planner
2. Choose "Browse Curated Recipes" mode
3. Verify it uses recipes from Recipe Database
4. Planned meals should reference same recipe data

### With Shopping List
1. Add recipe ingredients
2. Go to Shopping List
3. Verify ingredients appear correctly
4. Check, uncheck, delete items
5. Verify operations work normally

### With Global Search
1. Search from different pages (Today, Kitchen, People)
2. Verify recipe search works from all pages
3. Verify modal opens consistently
4. Verify navigation remains correct after closing modal

---

## Common Issues & Solutions

### Issue: Images not loading
**Solution**: Check network tab for failed requests. Unsplash URLs should load. If blocked, check ad blockers or network restrictions.

### Issue: Search not filtering
**Solution**: Check console for JavaScript errors. Verify `searchQuery` state updates. Check filter logic in `useEffect`.

### Issue: Modal not closing
**Solution**: Verify `setSelectedRecipe(null)` is called. Check z-index conflicts. Ensure event handlers are attached.

### Issue: Shopping list not updating
**Solution**: Check `/api/shopping/add` endpoint. Verify localStorage updates. Check for console errors.

### Issue: Back button not working
**Solution**: Verify Link component has correct `href`. Check if `useRouter` is imported. Ensure no conflicting click handlers.

---

## Success Indicators

✅ **Feature is working correctly if**:
- All 7 test scenarios pass
- No console errors
- No visual bugs or layout issues
- Navigation is smooth and predictable
- Data persists correctly
- Mobile responsive (if tested)

🎯 **Ready for production if**:
- All tests complete successfully
- Performance is acceptable (< 2s page loads)
- No linting errors
- No TypeScript errors
- Documentation is complete
- Integration with other features works

---

## Automated Testing Commands

```bash
# Check TypeScript compilation
npm run build

# Check linting
npm run lint

# Run dev server
npm run dev

# Access application
http://localhost:3000/kitchen
http://localhost:3000/kitchen/recipes
```

---

## Report Template

**Date Tested**: ___________
**Tester**: ___________
**Environment**: Dev / Staging / Production

| Scenario | Pass | Fail | Notes |
|----------|------|------|-------|
| Browse Recipe Library | ☐ | ☐ | |
| Local Search | ☐ | ☐ | |
| View Recipe Details | ☐ | ☐ | |
| Add to Shopping List | ☐ | ☐ | |
| Global Search | ☐ | ☐ | |
| Category Filters | ☐ | ☐ | |
| Kitchen Integration | ☐ | ☐ | |
| Navigation Flow | ☐ | ☐ | |

**Overall Result**: Pass ☐ / Fail ☐
**Additional Comments**: ________________________________

---

*Testing Guide Version: 1.0*
*Last Updated: 2026-01-19*
