# Meal Swap System - Testing Guide

## Quick Test (5 minutes)

### Test 1: Enter Swap Mode
1. Go to `http://localhost:3000/kitchen`
2. Plan meals for the week (if not already done)
3. Click any day card that has meals
4. On Meal Day View, click "Swap Recipe" button
5. **Expected**: Navigate to Recipe Library
6. **Expected**: URL contains `?swap=true&day=...&mealType=...&mealId=...`
7. **Expected**: Header shows "Swap Meal"
8. **Expected**: Subtitle shows "Replacing [meal type] for [day]"
9. **Expected**: Orange "Swap Mode Active" banner visible

✅ **Pass if**: Swap mode entered with full context

---

### Test 2: Replace Meal (Grid View)
1. In swap mode (from Test 1)
2. Browse recipes in grid view
3. Find a recipe card
4. **Expected**: Card shows "Use This Recipe" button (orange)
5. Click "Use This Recipe"
6. **Expected**: Confirmation prompt appears
7. Confirm replacement
8. **Expected**: Alert "Meal replaced successfully!"
9. **Expected**: Navigate back to Meal Day View
10. **Expected**: Meal updated immediately

✅ **Pass if**: Meal replaced and displayed correctly

---

### Test 3: Replace Meal (Modal View)
1. Enter swap mode
2. Click a recipe card to open modal
3. **Expected**: Modal opens with full recipe details
4. **Expected**: Primary button: "Use This Recipe for [meal type]" (large, orange)
5. **Expected**: NO "Add to Shopping" button
6. **Expected**: NO "Add to Meal Plan" button
7. Click "Use This Recipe for [meal]"
8. **Expected**: Meal replaced, navigate back

✅ **Pass if**: Modal shows correct actions for swap mode

---

### Test 4: Cancel Swap
1. Enter swap mode
2. Click "Cancel Swap" button (top left)
3. **Expected**: Navigate back to Meal Day View
4. **Expected**: Original meal unchanged
5. **Expected**: No modifications to localStorage

✅ **Pass if**: Cancel works, no data modified

---

### Test 5: Swap with Filters
1. Enter swap mode (e.g., replacing Tuesday Dinner)
2. **Expected**: Meal type auto-filtered to "Dinner"
3. Click different cuisine (e.g., "Italian")
4. **Expected**: See only Italian dinners
5. Select a recipe
6. **Expected**: Replacement works correctly

✅ **Pass if**: Filters work in swap mode

---

## Detailed Testing

### Swap Mode Indicators

**Header**:
- [ ] Shows "Swap Meal" instead of "Recipe Library"
- [ ] Shows day and meal type being replaced
- [ ] "Cancel Swap" button present (top left)
- [ ] Back arrow instead of normal back link

**Banner**:
- [ ] Orange "Swap Mode Active" banner visible
- [ ] Shows which meal is being replaced
- [ ] Shows which day
- [ ] RefreshCw icon present

**Auto-Filter**:
- [ ] Meal type filter automatically set
- [ ] Can still change filters
- [ ] Results update correctly

---

### Grid View (Swap Mode)

**Recipe Cards**:
- [ ] Show "Use This Recipe" button (orange gradient)
- [ ] Button has Check icon
- [ ] Click triggers confirmation
- [ ] Confirmation shows correct meal type
- [ ] No generic card click (no modal opens from card)

**Normal Elements**:
- [ ] Recipe image visible
- [ ] Title, description, time, servings shown
- [ ] Cuisine label visible
- [ ] Liked badge shows (if liked)

---

### Discover Mode (Swap Mode)

**Single Card View**:
- [ ] Shows one recipe at a time
- [ ] "Use This Recipe" button present
- [ ] Swipe actions work (like/skip)
- [ ] Can still view full recipe
- [ ] Replacement works from discover mode

---

### Recipe Detail Modal (Swap Mode)

**Primary Action**:
- [ ] Large orange button
- [ ] Text: "Use This Recipe for [meal type]"
- [ ] Check icon present
- [ ] Click replaces meal and navigates back

**Secondary Actions**:
- [ ] "Save to Favorites" available
- [ ] Heart icon updates on click
- [ ] NO "Add to Shopping" button
- [ ] NO "Add to Meal Plan" button

**Close/Back**:
- [ ] "Back to Results" button (not "Close")
- [ ] Returns to Recipe Library in swap mode
- [ ] Swap context preserved

---

### Recipe Detail Modal (Normal Mode)

**Actions Available**:
- [ ] "Save to Favorites"
- [ ] "Add Ingredients to Shopping"
- [ ] "Close" button
- [ ] NO "Add to Meal Plan coming soon"

---

### Replacement Logic

**Data Update**:
- [ ] Only target meal updated (by ID)
- [ ] Recipe data replaced:
  - Title
  - Description
  - Image
  - Ingredients
  - Instructions
  - Prep time
  - Servings
- [ ] Meal ID preserved
- [ ] Date preserved
- [ ] Meal type preserved
- [ ] Cooked status preserved (if was cooked)

**Event Propagation**:
- [ ] `mealsUpdated` event dispatched
- [ ] Kitchen Hub calendar updates
- [ ] Today's Meal updates (if today)
- [ ] Meal Day View reloads

**Navigation**:
- [ ] Returns to correct view (`returnTo` URL)
- [ ] View shows updated meal immediately
- [ ] No stale data

---

### Edge Cases

**No Swap Context**:
- [ ] Recipe Library works normally
- [ ] No swap banner
- [ ] Normal actions available

**Invalid Meal ID**:
- [ ] Replacement fails gracefully
- [ ] Error alert shown
- [ ] No data corruption

**Multiple Swaps**:
- [ ] Can swap multiple meals in sequence
- [ ] Each swap maintains correct context
- [ ] No cross-contamination

**Swap + Allergy Filter**:
- [ ] Swap mode respects allergy filters
- [ ] Can't replace with unsafe recipe
- [ ] Safety banner still visible

---

## Visual Verification

### Swap Mode Colors
- **Orange**: Swap banner, replace buttons
- **Red**: Allergy warnings (if present)
- **Purple**: Cuisine filters, discover mode
- **Pink**: Favorites/liked

### Button Hierarchy

**Swap Mode Modal**:
1. Primary: "Use This Recipe" - Orange, large, bold
2. Secondary: "Save to Favorites" - White with border
3. Tertiary: "Back to Results" - Text only

**Normal Mode Modal**:
1. Primary: "Save to Favorites" - Pink
2. Secondary: "Add to Shopping" - Blue
3. Tertiary: "Close" - Text only

---

## Integration Tests

### With Allergy System
1. Set allergies: Dairy + Gluten
2. Enter swap mode
3. Browse recipes
4. **Expected**: Unsafe recipes hidden
5. Select safe recipe
6. **Expected**: Replacement works
7. Meal respects allergies

### With Favorites
1. Like 3-4 recipes
2. Enter swap mode
3. Click heart filter
4. **Expected**: See only liked recipes
5. Can replace with liked recipe

### With Shopping List
1. Replace a meal
2. New meal has different ingredients
3. Navigate to shopping list
4. **Expected**: Can add new meal's ingredients
5. Old ingredients not auto-removed

---

## Performance Checks

- [ ] Swap mode loads fast (<500ms)
- [ ] No lag when filtering
- [ ] Replacement instant (<100ms)
- [ ] Navigation smooth
- [ ] No console errors
- [ ] Event dispatch works

---

## User Experience Checks

### Clarity
- [ ] Always know what's being replaced
- [ ] Context visible throughout
- [ ] Actions clearly labeled

### Confidence
- [ ] Confirmation before replacement
- [ ] Success feedback after replacement
- [ ] Cancel option always available

### Navigation
- [ ] Back button works
- [ ] Cancel works
- [ ] Returns to correct view
- [ ] No trapped states

---

## Comparison: Before vs After

### Before (Broken)
```
Click "Swap Recipe"
    ↓
Recipe Library opens
    ❌ No context (which meal? which day?)
    ❌ "Add to Meal Plan" says "coming soon"
    ❌ Can't complete the swap
    ❌ Navigation unclear
```

### After (Fixed)
```
Click "Swap Recipe"
    ↓
Recipe Library (Swap Mode)
    ✅ Orange banner: "Replacing dinner for Tuesday"
    ✅ URL contains full context
    ✅ "Use This Recipe" button ready
    ✅ One-click replacement
    ✅ Returns to Meal Day View
```

---

## Success Indicators

✅ **Context Awareness**:
- Swap mode knows what it's replacing
- Context visible in UI
- URL parameters preserve state

✅ **Action Clarity**:
- "Use This Recipe" button clear
- Confirmation before action
- Success feedback after action

✅ **Navigation**:
- Always returns to origin
- Cancel works
- No dead ends

✅ **Data Integrity**:
- Correct meal replaced
- Other meals preserved
- Events propagate
- UI updates immediately

---

## Common Issues & Solutions

### Issue: Swap mode doesn't activate
**Solution**: Check URL parameters. Verify `swap=true` present.

### Issue: Wrong meal replaced
**Solution**: Check `mealId` parameter matches. Verify localStorage structure.

### Issue: Navigation doesn't return
**Solution**: Check `returnTo` parameter. Verify router.push works.

### Issue: Meal doesn't update
**Solution**: Verify `mealsUpdated` event dispatched. Check loadMeals() called.

---

## Report Template

**Date Tested**: ___________
**Tester**: ___________

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Enter swap mode | ☐ | ☐ | |
| Swap banner shows | ☐ | ☐ | |
| Context preserved | ☐ | ☐ | |
| Replace from grid | ☐ | ☐ | |
| Replace from modal | ☐ | ☐ | |
| Confirmation works | ☐ | ☐ | |
| Navigation returns | ☐ | ☐ | |
| Meal updates | ☐ | ☐ | |
| Cancel swap works | ☐ | ☐ | |
| Events propagate | ☐ | ☐ | |

**Overall Result**: Pass ☐ / Fail ☐
**Comments**: ________________________________

---

*Testing Guide Version: 5.0*
*Last Updated: 2026-01-19*
*Feature: Context-Aware Meal Swapping*
