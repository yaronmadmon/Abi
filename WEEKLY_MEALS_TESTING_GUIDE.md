# Weekly Meals Control Layer - Testing Guide

## Quick Test (5 minutes)

### Test 1: Navigate to Meal Day View
1. Go to `http://localhost:3000/kitchen`
2. Scroll to "This Week's Meals" section
3. Click any day card that has meals
4. **Expected**: Navigate to full-page Meal Day View (NOT a modal)
5. **Expected**: See URL change to `/kitchen/day/2026-01-XX`
6. **Expected**: Page shows meals with action buttons

✅ **Pass if**: Navigation works, no modal appears, full page loads

### Test 2: Action Buttons Work
1. On Meal Day View, find a meal
2. Click **"Add to Shopping"** button
3. **Expected**: Confirmation prompt appears
4. Confirm addition
5. **Expected**: Alert shows ingredient count
6. Navigate to Today → Shopping
7. **Expected**: Ingredients appear in shopping list

✅ **Pass if**: Ingredients added successfully

### Test 3: Mark as Cooked
1. On Meal Day View, click checkmark in meal header
2. **Expected**: "Cooked" badge appears
3. Click checkmark again
4. **Expected**: "Cooked" badge disappears

✅ **Pass if**: Toggle works, badge displays correctly

### Test 4: Recipe Title Navigation
1. On Meal Day View, click the recipe title
2. **Expected**: Navigate to Recipe Library (or recipe detail)
3. **Expected**: See book icon appear on hover
4. **Expected**: Can navigate back

✅ **Pass if**: Recipe title is clickable and navigates

### Test 5: Back Navigation
1. From Meal Day View, click "Back to Kitchen"
2. **Expected**: Return to Kitchen page
3. **Expected**: No modal leftover, clean state

✅ **Pass if**: Navigation is clear and works

---

## Detailed Testing

### Kitchen Page Changes

#### What Was Removed ❌
- Day Detail Modal (floating recipe viewer)
- Modal overlay with recipe details
- Trapped navigation in modal
- Delete button in modal

#### What Was Added ✅
- Direct navigation to Meal Day View
- `handleDayClick()` function
- Clean URL-based routing

**Test**:
```
1. Click any day card
2. Verify: Page navigates (URL changes)
3. Verify: No modal appears
4. Verify: Clean navigation
```

---

### Meal Day View Page

**URL Pattern**: `/kitchen/day/[date]`
**Example**: `/kitchen/day/2026-01-19`

#### Header Section
- [ ] Date displays correctly (e.g., "Monday, January 19, 2026")
- [ ] Meal count shows (e.g., "3 meals planned")
- [ ] "Back to Kitchen" link works
- [ ] Back link has chevron icon

#### Meal Cards
- [ ] Meal type header has correct color:
  - Breakfast: Yellow-orange
  - Lunch: Green
  - Dinner: Blue
  - Baking: Pink
- [ ] Recipe image displays (132x132px)
- [ ] Recipe title is bold and clickable
- [ ] Description shows
- [ ] Prep time and servings display
- [ ] Checkmark button in header

#### Cooked Status
- [ ] Click checkmark → "Cooked" badge appears
- [ ] Click again → badge disappears
- [ ] Badge has checkmark icon
- [ ] Status persists on refresh

#### Readiness Check
- [ ] Blue info box displays
- [ ] Shows ingredient count
- [ ] Shows placeholder text for pantry
- [ ] AlertCircle icon present

#### Ingredient Preview
- [ ] Shows up to 6 ingredients
- [ ] Ingredients display as chips
- [ ] "+X more" chip if >6 ingredients
- [ ] Ingredients are readable

#### Action Buttons
**Add to Shopping**:
- [ ] Blue gradient button
- [ ] ShoppingCart icon
- [ ] Click triggers confirmation
- [ ] Confirmation shows ingredient count
- [ ] Accept adds to shopping list
- [ ] Cancel does nothing

**Swap Recipe**:
- [ ] White button with border
- [ ] RefreshCw icon
- [ ] Click navigates to Recipe Library
- [ ] URL includes `?filter=[mealType]`
- [ ] Can browse recipes

**Remove from Plan**:
- [ ] Full-width button
- [ ] Red text
- [ ] Trash icon
- [ ] Confirmation required
- [ ] Accept removes meal
- [ ] If last meal, returns to Kitchen

---

### Integration Tests

#### With Shopping List
1. Add ingredients from Meal Day View
2. Navigate to Shopping List
3. Verify items appear
4. Verify category is "recipe-ingredients"
5. Verify no duplicates if added twice

#### With Recipe Library
1. Click recipe title in Meal Day View
2. Should open full recipe (future)
3. Currently shows book icon on hover
4. Placeholder for recipe detail link

#### With Kitchen Page
1. "Clear All" still works
2. Day cards update after changes
3. Meal counts accurate
4. Events propagate correctly

---

## Edge Cases

### No Meals for Day
1. Generate meal plan with gaps
2. Click day with no meals
3. **Expected**: Meal Day View shows "No meals planned"
4. **Expected**: Button to "Plan Meals"
5. Click button → navigates to Meal Planner

### Last Meal Removed
1. Open Meal Day View with 1 meal
2. Click "Remove from Plan"
3. Confirm removal
4. **Expected**: Auto-navigate back to Kitchen
5. **Expected**: No empty page state

### Multiple Meals Same Day
1. Plan breakfast + lunch + dinner
2. Open that day
3. **Expected**: All meals show in order
4. **Expected**: Each has full action set
5. **Expected**: Sorted by meal type

### Cooked Status Persistence
1. Mark meal as cooked
2. Leave page
3. Return to same day
4. **Expected**: "Cooked" badge still there
5. **Expected**: Status in localStorage

---

## Visual Verification

### Layout
- [ ] Content max-width 2xl (672px)
- [ ] Proper spacing between meals
- [ ] Cards have shadow and border
- [ ] Responsive on mobile

### Colors & Gradients
- [ ] Meal type headers have gradients
- [ ] Buttons have correct colors
- [ ] Hover states work
- [ ] Focus states visible

### Typography
- [ ] Date is 3xl, bold
- [ ] Recipe title is xl, bold
- [ ] Body text readable (sm)
- [ ] Icons sized appropriately

### Interactions
- [ ] Buttons have hover effects
- [ ] Click feedback visible
- [ ] Loading states (if applicable)
- [ ] Smooth transitions

---

## Performance Checks

- [ ] Page loads fast (<500ms)
- [ ] Images load progressively
- [ ] No console errors
- [ ] No network errors
- [ ] Smooth navigation
- [ ] Instant state updates

---

## Accessibility

- [ ] Links have clear text
- [ ] Buttons have descriptive labels
- [ ] Icons have titles/tooltips
- [ ] Color contrast sufficient
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

---

## Comparison: Before vs After

### Before (Modal Pattern)
```
Click day card
    ↓
Floating modal opens
    ↓
Shows full recipe (ingredients + instructions)
    ↓
Duplicate of Recipe Library
    ↓
Hard to close, trapped navigation
```

**Problems**:
- Modal doesn't fit screen
- No clear back button
- Duplicates Recipe Library
- No actions, just viewing

### After (Full Page Pattern)
```
Click day card
    ↓
Navigate to /kitchen/day/[date]
    ↓
Meal Day View opens (full page)
    ↓
Shows context + actions
    ↓
Recipe title links to Recipe Library
    ↓
Clear back navigation
```

**Benefits**:
- Full page, proper layout
- Clear navigation
- Action-oriented
- No duplication
- Purpose-built for execution

---

## Success Indicators

✅ **Navigation is fixed**:
- No modal appears
- URL changes on navigation
- Back button works
- No trapped states

✅ **Actions are present**:
- Add to Shopping works
- Mark as Cooked toggles
- Swap Recipe navigates
- Remove from Plan deletes

✅ **Purpose is clear**:
- Not a recipe viewer
- Focused on meal execution
- Actionable controls
- Distinct from Recipe Library

---

## Common Issues & Solutions

### Issue: Day card doesn't navigate
**Solution**: Check `handleDayClick()` is called correctly. Verify router.push works.

### Issue: Meal Day View shows 404
**Solution**: Ensure route `/kitchen/day/[date]/page.tsx` exists. Check date format (YYYY-MM-DD).

### Issue: Actions don't work
**Solution**: Check localStorage access. Verify API endpoints. Check for console errors.

### Issue: Back navigation doesn't work
**Solution**: Verify Link component href="/kitchen". Check router import.

### Issue: Cooked status doesn't persist
**Solution**: Check localStorage.setItem calls. Verify event dispatch. Check loadMeals() logic.

---

## Testing Commands

```bash
# Start dev server
npm run dev

# Access Kitchen page
http://localhost:3000/kitchen

# Test specific date (manually)
http://localhost:3000/kitchen/day/2026-01-20

# Check for errors
# Open DevTools → Console tab
# Should see no errors

# Check localStorage
# DevTools → Application → Local Storage
# Verify 'weeklyMeals' key exists
```

---

## Report Template

**Date Tested**: ___________
**Tester**: ___________

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Navigate to Meal Day View | ☐ | ☐ | |
| Add to Shopping works | ☐ | ☐ | |
| Mark as Cooked toggles | ☐ | ☐ | |
| Recipe title clickable | ☐ | ☐ | |
| Back navigation clear | ☐ | ☐ | |
| Swap Recipe navigates | ☐ | ☐ | |
| Remove from Plan works | ☐ | ☐ | |
| No modal appears | ☐ | ☐ | |
| URL routing correct | ☐ | ☐ | |
| Actions persist | ☐ | ☐ | |

**Overall Result**: Pass ☐ / Fail ☐
**Comments**: ________________________________

---

*Testing Guide Version: 1.0*
*Last Updated: 2026-01-19*
