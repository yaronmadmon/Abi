# 🧪 VISUAL TESTING GUIDE - Premium Mobile Architecture

## Quick Start
**Dev Server**: `http://localhost:3000`

---

## 🎯 TEST 1: Kitchen → Meal Planner Flow

### Steps
1. Go to `http://localhost:3000/kitchen`
2. **VERIFY**: You see two orange CTAs:
   - "What's for Dinner?" (large, gradient)
   - "Meal Planner" (smaller, bordered)
3. Click either CTA
4. **VERIFY**: Full-screen page opens at `/kitchen/planner`
5. **VERIFY**: Header shows:
   - Back button (← icon)
   - Chef hat icon
   - "Meal Planner" title
   - "What are we planning?" subtitle

### Step 1: Meal Type Selection
1. **VERIFY**: 4 cards displayed:
   - 🍳 Breakfast
   - 🥪 Lunch
   - 🍽️ Dinner (selected by default)
   - 🧁 Baking
2. Click "Breakfast"
3. **VERIFY**: Card turns orange with white text + checkmark badge
4. Click "Dinner" to deselect
5. **VERIFY**: Card returns to white with gray border
6. Re-select "Dinner" and click "Next"

### Step 2: Time Range
1. **VERIFY**: 3 options displayed:
   - Just Today
   - This Week (recommended)
   - Custom Range
2. Click "This Week"
3. **VERIFY**: Card shows orange border + checkmark
4. **VERIFY**: Button says "Create Plan"
5. Click "Create Plan"

### Step 3: Planning State
1. **VERIFY**: Immediate transition to loading screen
2. **VERIFY**: Shows:
   - Large orange circle with Sparkles icon (pulsing)
   - "Creating your meal plan" heading
   - Description text about leftover logic
   - 3 animated dots (bouncing)
3. **WAIT**: 3-5 seconds

### Step 4: Results
1. **VERIFY**: Success banner at top:
   - Green gradient background
   - "Plan Created!" heading
   - "{X} meals added • Shopping list updated"
   - Two badges: "Added to calendar" + "Groceries ready"
2. **VERIFY**: Expandable day cards below
3. Click a day card (e.g., Monday)
4. **VERIFY**: Expands to show meals:
   - Meal images (photos)
   - Meal type tags (BREAKFAST, DINNER, etc.)
   - Titles and descriptions
   - Prep times and ingredient counts
   - Some meals may have "Leftovers" badge (green)
5. **VERIFY**: "Done" button at bottom (orange)
6. Click "Done"
7. **VERIFY**: Navigate back to Kitchen page
8. **VERIFY**: "This Week's Meals" calendar now has meals

**Expected Time**: ~45 seconds
**Expected Feel**: Decisive, effortless, powerful

---

## 🎯 TEST 2: Quick Capture Flow

### Entry from Today Page
1. Go to `http://localhost:3000/today`
2. Scroll to "Quick Capture" section
3. **VERIFY**: 5 buttons visible:
   - Thought (💡)
   - To-Do (✓)
   - Reminder (🔔)
   - Appointment (📅)
   - Note (📄)
4. Click "To-Do" button

### Full-Page Capture
1. **VERIFY**: Full-screen page opens at `/capture?type=task`
2. **VERIFY**: Header shows:
   - Back button
   - Blue gradient icon (✓)
   - "Quick Capture" title
   - "To-Do" subtitle
3. **VERIFY**: Type selector pills at top:
   - To-Do (selected, blue)
   - Appointment
   - Note
   - Thought
4. **VERIFY**: Large text area with placeholder:
   - "What needs to be done?"
5. Type: "Buy milk"
6. **VERIFY**: Character counter updates
7. **VERIFY**: Blue "Add Task" button at bottom
8. Click "Add Task"
9. **VERIFY**: Toast message: "Task added"
10. **VERIFY**: Navigate back to Today page
11. **VERIFY**: To-Do card count incremented

**Expected Time**: ~10 seconds
**Expected Feel**: Quick, focused, no distractions

---

## 🎯 TEST 3: Quick Capture Type Switching

1. Go to `/capture?type=note`
2. **VERIFY**: Opens with "Note" selected (gray)
3. Click "Thought" pill
4. **VERIFY**: Switches to yellow theme
5. **VERIFY**: Placeholder changes to "Capture a thought..."
6. **VERIFY**: Button changes to "Save Thought" (yellow)
7. Click "Appointment" pill
8. **VERIFY**: Switches to purple theme
9. **VERIFY**: Placeholder changes
10. **VERIFY**: Button changes to "Add Appointment"

**Expected Behavior**: Instant switching, no page reload

---

## 🎯 TEST 4: Weekly Meals Modal (Acceptable Bottom Sheet)

1. Go to `http://localhost:3000/kitchen`
2. Scroll to "This Week's Meals" section
3. **VERIFY**: 7 day cards (Mon-Sun)
4. **VERIFY**: Today's card has blue border
5. Click any day card (e.g., Monday)
6. **VERIFY**: Modal opens (read-only preview)
7. **VERIFY**: Modal is ~30-40% height (not full-screen)
8. **VERIFY**: Shows:
   - Day name and date
   - Meal cards with images
   - Meal details (type, title, description, prep time)
9. Tap outside modal
10. **VERIFY**: Modal closes
11. **VERIFY**: Back on Kitchen page

**Expected Behavior**: Lightweight preview, acceptable bottom sheet usage

---

## 🎯 TEST 5: Today Page Navigation

1. Go to `http://localhost:3000/today`
2. **VERIFY**: Summary cards visible:
   - To-Do (blue)
   - Appointments (purple)
   - Notes (gray)
   - Reminders (orange)
3. Click "To-Do" card
4. **VERIFY**: Navigate to `/dashboard/tasks`
5. Go back
6. Click "Notes" card
7. **VERIFY**: Navigate to `/dashboard/notes`
8. Go back
9. **VERIFY**: "Plan Something" card visible
10. Click "Plan Something"
11. **VERIFY**: Navigate to `/kitchen/planner`

**Expected Behavior**: All cards navigate, no modals

---

## 🎯 TEST 6: Kitchen Page Layout

1. Go to `http://localhost:3000/kitchen`
2. **VERIFY**: Section order (top to bottom):
   1. **Header**: Chef hat icon + "Kitchen" title
   2. **Today's Meal**: Card showing today's planned meals (or "No meals planned")
   3. **What's for Dinner?**: Large orange gradient CTA
   4. **Meal Planner**: Smaller orange bordered CTA
   5. **This Week's Meals**: 7-day calendar
   6. **Shopping List**: Preview of items
   7. **AI Input Bar**: At bottom (optional, context-aware)

**Expected Layout**: Clean, hierarchical, clear entry points

---

## 🎯 TEST 7: Meal Planner Edge Cases

### No Meal Types Selected
1. Go to `/kitchen/planner`
2. Deselect all meal types
3. **VERIFY**: "Next" button is disabled
4. **VERIFY**: Button appears grayed out

### Custom Range
1. Select "Custom Range"
2. **VERIFY**: Number input appears
3. Type "14"
4. **VERIFY**: Button says "Create Plan"
5. Click "Create Plan"
6. **VERIFY**: Generates 14 days of meals

### Multiple Meal Types
1. Select: Breakfast + Lunch + Dinner
2. Select: This Week
3. Click "Create Plan"
4. **VERIFY**: Generates 21 meals (3 types × 7 days)
5. **VERIFY**: Results show all 3 meal types

---

## 🎯 TEST 8: AI Context Preservation

### Kitchen AI Context
1. Go to `/kitchen`
2. **VERIFY**: AI Input Bar present (if implemented)
3. Type: "What should I cook?"
4. **VERIFY**: Response is kitchen-aware (mentions meals, recipes, ingredients)

### No Global AI Chat
1. Navigate between pages
2. **VERIFY**: No floating AI chat button
3. **VERIFY**: No global AI overlay
4. **VERIFY**: Each page has its own AI context

---

## 🎯 TEST 9: Leftover Logic

1. Generate a meal plan with Lunch + Dinner for a week
2. View results
3. **VERIFY**: Some lunch meals show "(Leftovers)" suffix
4. **VERIFY**: Leftover meals have green "Leftovers" badge
5. **VERIFY**: Leftover meals match previous night's dinner
6. **VERIFY**: Leftover meals have 5 min prep time

**Expected Behavior**: ~40% of lunches are leftovers from previous dinners

---

## 🎯 TEST 10: Shopping List Auto-Generation

1. Before generating meals, check shopping list
2. Note current item count
3. Generate a meal plan (Dinner, This Week)
4. Complete plan
5. Go to Shopping List (`/dashboard/shopping`)
6. **VERIFY**: New ingredients added
7. **VERIFY**: No duplicate items
8. **VERIFY**: Items are normalized (lowercase, trimmed)

---

## ✅ VISUAL CHECKLIST

### Colors & Branding
- [ ] Orange used for Kitchen/Meal Planner
- [ ] Blue for Tasks
- [ ] Purple for Appointments
- [ ] Gray for Notes
- [ ] Yellow for Thoughts
- [ ] Green for Success states

### Typography
- [ ] Headers are bold and clear
- [ ] Body text is readable (14-16px)
- [ ] Buttons have clear labels
- [ ] No truncated text

### Spacing
- [ ] Adequate padding in cards (p-4 to p-6)
- [ ] Clear gaps between sections (gap-3 to gap-6)
- [ ] No cramped layouts
- [ ] Comfortable tap targets (min 44×44px)

### Interactions
- [ ] Buttons have hover states
- [ ] Selected items have clear feedback
- [ ] Loading states are visible
- [ ] Transitions are smooth (not jarring)

### Navigation
- [ ] Back buttons always visible
- [ ] Back navigation preserves state
- [ ] No dead ends
- [ ] No broken links

### Mobile Feel
- [ ] Full-screen pages (not modals for core features)
- [ ] Easy thumb access
- [ ] No tiny tap targets
- [ ] Scrollable content doesn't cut off

---

## 🐛 COMMON ISSUES TO CHECK

### If Meal Planner Doesn't Load
1. Check browser console for errors
2. Verify OpenAI API key is set
3. Check dev server logs
4. Try refreshing page

### If Quick Capture Doesn't Save
1. Check localStorage in DevTools
2. Verify event listeners are triggered
3. Check for console errors
4. Try different capture types

### If Navigation Doesn't Work
1. Check router is properly imported
2. Verify routes exist in `app/` folder
3. Check for typos in URLs
4. Try hard refresh (Ctrl+Shift+R)

### If Images Don't Show
1. Check Unsplash URLs are valid
2. Verify AI returned imageUrl field
3. Check network tab for failed requests
4. Try fallback image

---

## 📊 SUCCESS METRICS

After testing, the app should feel:
- ✅ **Calm**: No overwhelming options or clutter
- ✅ **Intentional**: Every action has clear purpose
- ✅ **Powerful**: AI does work without asking
- ✅ **Trustworthy**: Predictable, reliable, transparent
- ✅ **Mobile-Native**: Feels like real app, not website

---

## 📞 REPORT ISSUES

If you find bugs:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check dev server logs in terminals folder
4. Verify localStorage data in DevTools

Happy testing! 🎉
