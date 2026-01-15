# UX Smoke Test Checklist (DEV ONLY)

This file is for development testing only and should NOT be shown in the app.

## Routes to Test

### ✅ `/today` - Landing Page
- [ ] Page loads without 404
- [ ] Shows "Today" header with current date
- [ ] AI Focus Header displays contextual insight
- [ ] "Now" Card shows urgent tasks/appointments (if any)
- [ ] Quick Capture Row shows 5 buttons (Thought, Task, Reminder, Appointment, Note)
- [ ] "Plan Something" card is clickable
- [ ] "Care / Reset" card displays with 2-min reset button
- [ ] Glance Bar shows weather and tomorrow peek (collapsible)
- [ ] Bottom nav is visible and "Today" is highlighted
- [ ] No content overlaps bottom nav
- [ ] Page is scrollable if content exceeds viewport

### ✅ `/home` - Home Section
- [ ] Page loads without 404
- [ ] Shows "Home" header with subtitle
- [ ] Summary cards visible: Tasks, Smart Home, Calendar
- [ ] Tasks summary shows count and urgent items
- [ ] AI input bar is present
- [ ] Full task list displays below summaries
- [ ] Bottom nav "Home" tab is highlighted
- [ ] No content overlaps bottom nav

### ✅ `/kitchen` - Kitchen Section
- [ ] Page loads without 404
- [ ] Shows "Kitchen" header with subtitle
- [ ] Summary cards visible: Today's Meals, Shopping List, Recipes, Pantry
- [ ] Weekly meal grid displays
- [ ] AI input bar is present
- [ ] Bottom nav "Kitchen" tab is highlighted
- [ ] No content overlaps bottom nav

### ✅ `/finance` - Finance Section
- [ ] Page loads without 404
- [ ] Shows "Finance" header with subtitle
- [ ] Summary cards visible: Bills, Budget, Subscriptions, Transactions
- [ ] Bottom nav "Finance" tab is highlighted
- [ ] No content overlaps bottom nav

### ✅ `/people` - People Section
- [ ] Page loads without 404
- [ ] Shows "People" header with subtitle
- [ ] Summary cards visible: Family, Pets, Applicants
- [ ] Bottom nav "People" tab is highlighted
- [ ] No content overlaps bottom nav

### ✅ `/office` - Office Section
- [ ] Page loads without 404
- [ ] Shows "Office" header with subtitle
- [ ] Summary cards visible: Documents, Scanner, Fax, Archive
- [ ] Bottom nav "Office" tab is highlighted
- [ ] No content overlaps bottom nav

## Bottom Navigation Tests

- [ ] All 6 tabs visible: Today, Home, Kitchen, Finance, People, Office
- [ ] Active tab shows blue color and is slightly scaled up
- [ ] Inactive tabs are gray
- [ ] Clicking tabs navigates to correct route
- [ ] Active state persists on page refresh
- [ ] Nav height is consistent (64px)
- [ ] Nav has backdrop blur effect
- [ ] Nav respects safe-area-inset-bottom on iOS

## Bottom Sheet Tests

### Quick Capture Sheet
- [ ] Opens when clicking any quick capture button
- [ ] Backdrop appears with blur
- [ ] Sheet slides up from bottom smoothly (220ms)
- [ ] Body scroll is locked when open
- [ ] Clicking backdrop closes sheet
- [ ] Sheet closes smoothly when dismissed
- [ ] Body scroll unlocks when closed
- [ ] AI input bar is functional inside sheet
- [ ] Sheet has proper z-index (above nav, below modals)

### Plan Something Sheet
- [ ] Opens when clicking "Plan Something" card
- [ ] Shows 5 planning options (Trip, Budget, Event, Wish list, Home project)
- [ ] Clicking option navigates to correct route and closes sheet
- [ ] Body scroll locked when open
- [ ] Backdrop click closes sheet
- [ ] Smooth open/close animations

## Animation Tests

- [ ] Fade-in animations work (200ms) - check cards on Today page
- [ ] Slide-up animations work (220ms) - check bottom sheets
- [ ] Scale animations work on buttons (active:scale-95, hover effects)
- [ ] Transitions are smooth, not jarring
- [ ] No animation flicker or jank

## Safe Area / iOS Tests

- [ ] Bottom nav respects safe-area-inset-bottom
- [ ] Page content padding accounts for bottom nav + safe area
- [ ] No content hidden behind iPhone home indicator
- [ ] Proper spacing on all device sizes

## Build & TypeScript Tests

- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] No console errors in browser
- [ ] All imports resolve correctly

## Navigation Stability Tests

- [ ] Refresh on any route doesn't cause 404
- [ ] Direct navigation to routes works (type URL)
- [ ] No redirect loops
- [ ] Browser back/forward buttons work correctly
- [ ] Active tab state persists across navigation

## Quick Test Script

Run these in browser console after loading each page:

```javascript
// Check bottom nav spacing
const nav = document.querySelector('nav[class*="fixed bottom-0"]');
const content = document.querySelector('.page-with-bottom-nav');
console.log('Nav height:', nav?.offsetHeight);
console.log('Content padding-bottom:', window.getComputedStyle(content || document.body).paddingBottom);

// Check safe area
console.log('Safe area bottom:', getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)'));
```
