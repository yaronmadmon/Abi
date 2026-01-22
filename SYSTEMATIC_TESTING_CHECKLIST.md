# Systematic App Testing Checklist

**Date:** January 21, 2026  
**Purpose:** Comprehensive sweep to identify all broken/non-functional features  
**Status:** In Progress

---

## How to Use This Checklist

1. **Test each section in order**
2. **Mark items**: ✅ Working | ❌ Broken | ⚠️ Partially working
3. **Note details**: For broken items, describe what happens vs. what should happen
4. **Report findings**: After each section, report broken items

---

## SECTION 1: TODAY PAGE (/today)

### Navigation (Bottom Nav)
- [ ] Click "Today" - stays on /today
- [ ] Click "Kitchen" - navigates to /kitchen
- [ ] Click "Finance" - navigates to /finance  
- [ ] Click "People" - navigates to /people
- [ ] Click "Office" - navigates to /office
- [ ] Click "Today" again - returns to /today
- [ ] Active tab is highlighted correctly

### Global Search Bar (Top of Page)
- [ ] Click search bar - can type
- [ ] Type "task" - shows search results
- [ ] Type "note" - shows search results
- [ ] Type "recipe" - shows search results
- [ ] Click result - navigates to correct page
- [ ] Clear search - results disappear

### Quick Capture Row (5 Buttons)
- [ ] Lightbulb icon (Thought) - opens thought sheet
- [ ] CheckSquare icon (Task) - opens task sheet
- [ ] Bell icon (Reminder) - opens reminder sheet
- [ ] Calendar icon (Appointment) - opens appointment sheet
- [ ] FileText icon (Note) - opens note sheet

### Weather Card
- [ ] Weather displays correctly
- [ ] Location shows (Brooklyn, NY or your location)
- [ ] Click "See 7-day forecast" - opens weather modal
- [ ] In modal: 7 days of forecast displayed
- [ ] In modal: Hourly forecast displayed
- [ ] In modal: "Change location" button works
- [ ] Type new location - weather updates
- [ ] Close modal - returns to Today page

### Calendar Card
- [ ] Current month displays
- [ ] Today's date is highlighted
- [ ] Previous month button works
- [ ] Next month button works
- [ ] Click on a date WITH appointment - shows appointment details
- [ ] Click on a date WITHOUT appointment - option to add appointment appears
- [ ] "Add appointment" button - opens appointment creation sheet
- [ ] Fill appointment details - saves successfully
- [ ] New appointment appears on calendar

### Now Card (Urgent Tasks & Next Appointment)
- [ ] Shows urgent tasks (if any)
- [ ] Shows next upcoming appointment (if any)
- [ ] Task checkboxes are clickable
- [ ] Clicking task checkbox - toggles task completion
- [ ] Task appears/disappears based on completion

### Glance Bar (4 Navigation Links)
- [ ] "Tasks" link - navigates to /dashboard/tasks
- [ ] "Appointments" link - navigates to calendar view
- [ ] "Notes" link - navigates to /dashboard/notes
- [ ] "Shopping" link - navigates to /dashboard/shopping
- [ ] Each shows correct count badge

### Care Card
- [ ] Shows family members (if any)
- [ ] Shows pets (if any)
- [ ] Click family member - navigates to /people/family
- [ ] Click pet - navigates to /people/pets

---

## SECTION 2: KITCHEN (/kitchen)

### Kitchen Hub Page
- [ ] "Recipes" card - navigates to /kitchen/recipes
- [ ] "Meal Planner" card - navigates to /kitchen/planner
- [ ] "Pantry" card - navigates to /kitchen/pantry
- [ ] "Settings" card - navigates to /kitchen/settings/allergies
- [ ] All "See all →" links work

### Recipes Page (/kitchen/recipes)
- [ ] Page loads with recipe grid
- [ ] Images display (90-95% should show)
- [ ] Search bar - can type
- [ ] Search "chicken" - filters recipes
- [ ] Clear search - shows all recipes
- [ ] Category tabs (All, Breakfast, Lunch, Dinner, Baking) - filter correctly
- [ ] Cuisine dropdown - shows options
- [ ] Select cuisine - filters recipes
- [ ] "Grid" view button - displays grid layout
- [ ] "Discover" view button - displays swipeable cards
- [ ] Heart icon - likes recipe
- [ ] ThumbsDown icon - dislikes recipe
- [ ] "Liked" filter - shows only liked recipes
- [ ] Shield icon - shows allergy filtering toggle
- [ ] Click recipe card - navigates to recipe detail

### Recipe Detail Page (/kitchen/recipes/[recipeId])
- [ ] Back arrow - returns to recipes list
- [ ] Recipe title displays
- [ ] Recipe image displays
- [ ] Ingredients list displays
- [ ] Instructions list displays
- [ ] Prep/cook/total time displays
- [ ] Servings count displays
- [ ] Serving size +/- buttons - adjust servings and ingredient quantities
- [ ] "View Measurement Conversions" button - opens converter modal
- [ ] "Get Substitution Ideas" button - opens substitution modal
- [ ] "Add to Meal Plan" button - navigates to planner or opens sheet
- [ ] Like/dislike buttons work

### Meal Planner (/kitchen/planner)
- [ ] Weekly calendar displays (7 days)
- [ ] Each day shows: Breakfast, Lunch, Dinner slots
- [ ] "+" button on empty slot - opens meal selection
- [ ] Clicking existing meal - shows meal details
- [ ] "Swap" button on meal - navigates to recipes with swap mode
- [ ] Delete meal button - removes meal
- [ ] Previous week button works
- [ ] Next week button works
- [ ] Current week indicator correct
- [ ] "Generate shopping list" button - creates shopping list from meals

### Day View (/kitchen/day/[date])
- [ ] Shows all meals for specific date
- [ ] Back navigation works
- [ ] Can edit meals for the day

### Pantry (/kitchen/pantry)
- [ ] Ingredient list displays
- [ ] Search bar filters ingredients
- [ ] Add ingredient button works
- [ ] Remove ingredient button works
- [ ] Quantity tracking works

### Allergy Settings (/kitchen/settings/allergies)
- [ ] Allergy checkboxes display (peanuts, dairy, eggs, gluten, etc.)
- [ ] Clicking checkbox - selects/deselects allergy
- [ ] "Show excluded recipes" toggle works
- [ ] "Save Preferences" button - saves and shows toast
- [ ] Back button - returns to kitchen
- [ ] Settings apply to recipe filtering

---

## SECTION 3: DASHBOARD PAGES

### Tasks Page (/dashboard/tasks)
- [ ] Task list displays
- [ ] Search bar filters tasks
- [ ] "+ Add To-Do" button - opens task creation form
- [ ] Fill task form - saves task
- [ ] Task appears in list
- [ ] Task checkbox - toggles completion ✅ **PREVIOUSLY BROKEN** - needs verification
- [ ] Delete button (X icon) - deletes task
- [ ] Task persists after page refresh
- [ ] Completed tasks move to bottom or separate section

### Notes Page (/dashboard/notes)
- [ ] Notes list displays
- [ ] Search bar filters notes
- [ ] "+ Add Note" FAB button (bottom right) - opens note editor **OR** navigates to /dashboard/notes/new
- [ ] Pin button - pins/unpins note
- [ ] Share button - opens share dialog ✅ **PREVIOUSLY FIXED** - needs verification
- [ ] Delete button - deletes note **PREVIOUSLY BROKEN - opened new notepad instead** - needs verification
- [ ] Click note title - navigates to note editor
- [ ] Note editor saves changes
- [ ] Notes persist after page refresh

### Note Editor (/dashboard/notes/[id])
- [ ] Note title editable
- [ ] Note body editable
- [ ] Changes save automatically or on button click
- [ ] Back button returns to notes list
- [ ] Delete works from editor
- [ ] Share works from editor

### Shopping List (/dashboard/shopping)
- [ ] Shopping items display
- [ ] "+ Add Item" button - opens add item form
- [ ] Fill item form - saves item
- [ ] Item appears in list
- [ ] Checkbox - marks item as checked/purchased
- [ ] Delete button - removes item
- [ ] "Clear Checked" button - removes all checked items
- [ ] Items persist after page refresh
- [ ] Category organization (if any)

### Meals (/dashboard/meals)
- [ ] Meal history displays
- [ ] "Generate Meal Ideas" button - opens AI meal generation
- [ ] AI suggests meals based on preferences
- [ ] Can accept/reject AI meal suggestions
- [ ] Meal preferences are editable
- [ ] Dietary restrictions apply correctly

### Weekly View (/dashboard/weekly)
- [ ] Week calendar displays
- [ ] Shows all planned meals
- [ ] Previous/next week navigation
- [ ] Can edit meals from this view
- [ ] Syncs with meal planner

---

## SECTION 4: FINANCE (/finance)

### Finance Hub
- [ ] Budget card - navigates to /finance/budget
- [ ] Bills card - navigates to /finance/bills
- [ ] Transactions card - navigates to /finance/transactions
- [ ] Subscriptions card - navigates to /finance/subscriptions

### Budget Page (/finance/budget)
- [ ] Budget categories display
- [ ] Add category button works
- [ ] Set budget amount works
- [ ] Spending vs budget displayed
- [ ] Visual indicators (progress bars, alerts)

### Bills Page (/finance/bills)
- [ ] Bill list displays
- [ ] Add bill button works
- [ ] Bill details editable
- [ ] Due date tracking works
- [ ] Mark as paid functionality
- [ ] Bills persist

### Transactions Page (/finance/transactions)
- [ ] Transaction list displays
- [ ] Add transaction button works
- [ ] Category filtering works
- [ ] Date range filtering works
- [ ] Transaction details complete
- [ ] Transactions persist

### Subscriptions Page (/finance/subscriptions)
- [ ] Subscription list displays
- [ ] Add subscription button works
- [ ] Renewal date tracking
- [ ] Cost calculation (monthly, annual)
- [ ] Cancel/pause subscription options
- [ ] Subscriptions persist

---

## SECTION 5: PEOPLE (/people)

### People Hub
- [ ] Family card - navigates to /people/family
- [ ] Pets card - navigates to /people/pets
- [ ] Applicants card - navigates to /people/applicants

### Family Page (/people/family)
- [ ] Family member cards display
- [ ] "+ Add Family Member" button works
- [ ] Fill family member form (name, relationship, birthday, photo)
- [ ] Member appears in list
- [ ] Edit button - opens edit form
- [ ] Delete button - removes member
- [ ] Birthday tracking displays
- [ ] Photo upload works
- [ ] Family members persist
- [ ] Members appear in Today page Care Card

### Pets Page (/people/pets)
- [ ] Pet cards display
- [ ] "+ Add Pet" button works
- [ ] Fill pet form (name, type, breed, age, photo)
- [ ] Pet appears in list
- [ ] Edit button - opens edit form
- [ ] Delete button - removes pet
- [ ] Care notes display
- [ ] Photo upload works
- [ ] Pets persist
- [ ] Pets appear in Today page Care Card

### Applicants Page (/people/applicants)
- [ ] Applicant list displays
- [ ] Add applicant button works
- [ ] Application status tracking
- [ ] Details view accessible

---

## SECTION 6: OFFICE (/office)

### Office Hub
- [ ] Documents card - navigates to /office/documents
- [ ] Scanner card - navigates to /office/scanner
- [ ] Fax card - navigates to /office/fax
- [ ] Archive card - navigates to /office/archive

### Documents Page (/office/documents)
- [ ] Document list displays
- [ ] Upload button works
- [ ] File picker opens
- [ ] Upload completes
- [ ] Document appears in list
- [ ] Click document - opens viewer
- [ ] Share button works
- [ ] Delete button works
- [ ] Documents persist

### Document Viewer
- [ ] Document content displays
- [ ] PDF rendering (if applicable)
- [ ] Image display (if applicable)
- [ ] Download button works
- [ ] Share button works
- [ ] Close button returns to list

### Scanner Page (/office/scanner)
- [ ] Camera access requested
- [ ] Camera feed displays
- [ ] "Scan" button - captures image
- [ ] Preview displays
- [ ] Save button - saves scanned document
- [ ] Cancel button - discards scan
- [ ] Scanned documents appear in Documents

### Fax Page (/office/fax)
- [ ] Fax list displays
- [ ] Send fax button works
- [ ] Recipient input works
- [ ] Document attachment works
- [ ] Send completes
- [ ] Received faxes display
- [ ] Fax history persists

### Archive Page (/office/archive)
- [ ] Archived items display
- [ ] Restore button - moves item back
- [ ] Permanent delete button - removes item
- [ ] Archive persists

---

## SECTION 7: SETTINGS

### Calendar Settings (/settings/calendar)
- [ ] Calendar system options display (Gregorian, Hebrew, Islamic)
- [ ] Primary calendar selection works
- [ ] Secondary calendar(s) selection works
- [ ] "Show in Today view" checkbox works
- [ ] "Show in Weekly view" checkbox works
- [ ] "Save Preferences" button - saves settings ✅ **PREVIOUSLY FIXED**
- [ ] Settings persist after refresh
- [ ] Back button works
- [ ] Calendar updates across app (Today page, appointments, meal planner)

### Main Settings (/settings)
- [ ] Settings categories display
- [ ] Calendar settings navigation works
- [ ] User preferences editable
- [ ] Theme toggle works (if present)
- [ ] Notification settings work
- [ ] Save changes functionality

---

## SECTION 8: AI & VOICE FEATURES

### AI Chat Console (Floating Button)
- [ ] Microphone button visible (bottom right)
- [ ] Click microphone - opens AI chat console
- [ ] Console displays correctly (doesn't block page content when closed)
- [ ] Text input field works
- [ ] Voice input button works (microphone access)
- [ ] Type command (e.g., "Add task: Buy milk tomorrow") - AI responds
- [ ] AI provides proposal/preview
- [ ] "Approve" button - executes command
- [ ] "Cancel" button - cancels command
- [ ] Command executes correctly (task appears)
- [ ] Close button - closes console
- [ ] Console doesn't block clicks when closed ✅ **PREVIOUSLY FIXED**

### Voice Assistant Features
- [ ] Voice recognition activates
- [ ] Speaks command back (text-to-speech)
- [ ] Processes voice commands
- [ ] Provides voice responses
- [ ] ElevenLabs integration works (if configured)

### AI-Powered Workflows
- [ ] "Generate meal plan" - AI suggests meals
- [ ] "Suggest recipe substitutions" - AI provides alternatives
- [ ] "Polish text" - AI improves text quality
- [ ] AI respects allergy preferences
- [ ] AI commands show approval UI (never auto-execute)

---

## SECTION 9: CROSS-FEATURE INTEGRATION

### Task Integration
- [ ] Create task with due date via AI
- [ ] Task appears in /dashboard/tasks
- [ ] Task appears in Today page NowCard (if urgent)
- [ ] Task count updates in GlanceBar
- [ ] Task appears in CalendarCard on due date
- [ ] Complete task - updates everywhere
- [ ] Delete task - removes everywhere

### Appointment Integration
- [ ] Create appointment via CalendarCard on Today page
- [ ] Appointment appears in calendar
- [ ] Appointment count updates on Today page
- [ ] Appointment shows in NowCard (if next appointment)
- [ ] Edit appointment - updates everywhere
- [ ] Delete appointment - removes everywhere

### Note Integration
- [ ] Create note via Quick Capture on Today page
- [ ] Note appears in /dashboard/notes
- [ ] Note count updates on Today page GlanceBar
- [ ] Search note in global search - appears in results
- [ ] Edit note - changes persist
- [ ] Delete note - removes everywhere and updates count

### Recipe → Meal Plan Integration
- [ ] View recipe in /kitchen/recipes
- [ ] Click "Add to Meal Plan"
- [ ] Select day and meal type
- [ ] Meal appears in /kitchen/planner
- [ ] Meal appears in weekly view
- [ ] Meal appears in specific day view
- [ ] Generate shopping list from meal - ingredients appear in shopping list

### Shopping List Integration
- [ ] Add item manually in /dashboard/shopping
- [ ] Item persists
- [ ] Generate items from meal plan
- [ ] Meal ingredients appear as shopping items
- [ ] Check off items - marks as purchased
- [ ] Clear checked items - removes them
- [ ] Shopping count updates on Today page

### Family/Pet → Today Page Integration
- [ ] Add family member in /people/family
- [ ] Member appears in Today page CareCard
- [ ] Add pet in /people/pets
- [ ] Pet appears in Today page CareCard
- [ ] Edit family/pet - updates on Today page
- [ ] Delete family/pet - removes from Today page

### Calendar Preferences Integration
- [ ] Change calendar system in /settings/calendar
- [ ] Save preferences
- [ ] Dates update on Today page calendar
- [ ] Dates update in appointment displays
- [ ] Dates update in meal planner
- [ ] Secondary calendar displays (if enabled)
- [ ] Hebrew/Islamic dates format correctly

### Allergy Preferences Integration
- [ ] Set allergies in /kitchen/settings/allergies
- [ ] Save preferences
- [ ] Recipes page filters unsafe recipes (if toggle off)
- [ ] Shield icon shows allergy status
- [ ] "Show excluded" toggle - reveals/hides unsafe recipes
- [ ] Recipe detail page shows allergen warnings
- [ ] Meal suggestions respect allergies
- [ ] Substitution suggestions avoid allergens

---

## SECTION 10: DATA PERSISTENCE

### After Page Refresh (Ctrl+R)
- [ ] Tasks persist in /dashboard/tasks
- [ ] Notes persist in /dashboard/notes
- [ ] Shopping items persist in /dashboard/shopping
- [ ] Appointments persist in calendar
- [ ] Meal plan persists in /kitchen/planner
- [ ] Liked recipes persist in /kitchen/recipes
- [ ] Family members persist in /people/family
- [ ] Pets persist in /people/pets
- [ ] Allergy preferences persist
- [ ] Calendar preferences persist
- [ ] Theme preferences persist

### After Closing Browser & Reopening
- [ ] All data still present
- [ ] No data loss
- [ ] Preferences maintained

---

## SECTION 11: ERROR HANDLING

### Empty States
- [ ] Tasks page with 0 tasks - shows "No tasks" message
- [ ] Notes page with 0 notes - shows "No notes" message
- [ ] Shopping list empty - shows empty state
- [ ] Meal planner empty - shows empty slots with "+" buttons
- [ ] Family page empty - shows "Add family member" prompt
- [ ] Pets page empty - shows "Add pet" prompt

### Error States
- [ ] Invalid form input - shows validation error
- [ ] Failed AI request - shows error message
- [ ] Network error - handles gracefully
- [ ] Missing image - shows placeholder ✅ **RECENTLY FIXED**
- [ ] Component error - shows error boundary fallback ✅ **RECENTLY ADDED**

---

## SECTION 12: UI/UX CONSISTENCY

### Theme
- [ ] Dark mode toggle works
- [ ] Theme persists across pages
- [ ] All colors readable in both themes
- [ ] Proper contrast everywhere

### Mobile Responsiveness
- [ ] App displays in mobile preview frame
- [ ] Bottom navigation fixed at bottom
- [ ] All buttons reachable
- [ ] Text readable on mobile size
- [ ] No horizontal scrolling
- [ ] Touch interactions work

### Loading States
- [ ] Weather card shows loading indicator
- [ ] AI responses show loading indicator
- [ ] Page transitions smooth
- [ ] No blank screens during load

---

## TESTING WORKFLOW

### Round 1: Quick Sweep (30 minutes)
1. Navigate to each of 5 main sections
2. Click main navigation elements
3. Note immediate broken features
4. Document in "High Priority" section

### Round 2: Feature Deep Dive (2 hours)
1. Test each interactive element in each section
2. Verify data flows
3. Check persistence
4. Document all issues by priority

### Round 3: Integration Testing (1 hour)
1. Test cross-feature data sync
2. Verify calendar preference changes propagate
3. Verify allergy preferences apply everywhere
4. Test AI approval flow end-to-end

### Round 4: Report & Fix Plan (30 minutes)
1. Compile all findings
2. Prioritize fixes
3. Create fix plan

---

## REPORT TEMPLATE

### Section: [Name]
**Status**: ✅ Fully Working | ⚠️ Mostly Working | ❌ Broken

**Working Features**:
- Feature 1
- Feature 2

**Broken Features**:
- **Feature X**: Expected [behavior], got [actual behavior]
- **Feature Y**: Button does nothing, no console error

**Missing Connections**:
- Feature should sync with X but doesn't

**Priority**: High | Medium | Low

---

## CURRENT KNOWN ISSUES (From Previous Testing)

### ✅ FIXED
1. Todo list checkbox not clicking - **FIXED** (AI console overlay removed)
2. Note delete button opening new notepad - **FIXED** 
3. Share icon not connected - **FIXED** (navigator.share() added)
4. Calendar appointment creation from Today page - **ADDED**
5. Recipe images showing broken icons - **FIXED** (graceful fallback added)
6. Missing `X` import causing crash - **FIXED**
7. Console logging replaced with structured logger - **FIXED**

### ⚠️ NEEDS VERIFICATION
- All above fixes need to be verified in this comprehensive test
- Any new issues discovered since fixes

---

## NEXT STEPS

1. **Start testing** from Section 1 (Today page)
2. **Test methodically** through each section
3. **Report findings** after each section (or note them in this doc)
4. **I'll fix issues** as we discover them
5. **Re-test fixes** before moving to next section

**Ready to begin systematic testing!**
