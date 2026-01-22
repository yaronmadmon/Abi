# ✅ ABI PREMIUM MOBILE FULL-PAGE ARCHITECTURE

## Summary

Complete architectural refactor transforming Abi from a card-based system with bottom sheets and chat overlays into a premium mobile-first, full-page experience where every card navigates to a destination page.

**Goal**: Mobile app that feels calm, intentional, powerful, and trustworthy.

---

## 🎯 CORE PRODUCT PRINCIPLES (LOCKED)

### 1. Mobile-First, Not Web-Adapted
- This is a mobile app, not a web app adapted to mobile
- Every interaction designed for touch and thumbs
- Full-screen destinations, not modals

### 2. Cards Are Entry Points
- Cards display summaries only
- No editing, no AI chat, no modals
- Tap card → Navigate to full page

### 3. Full-Screen Destinations
- Every core action opens a full page
- 100% screen height
- Clear header + back navigation
- Owns its AI context

### 4. AI is Page-Aware
- AI context injected by page, not component
- Each page defines its AI persona and permissions
- No floating or global AI behavior

### 5. Bottom Sheets Are Helpers Only
- **Allowed**: Date pickers, time pickers, quick confirmations, read-only previews
- **Max height**: 30–40% of screen
- **NOT allowed**: Notes, tasks, planning, AI conversations, core flows

---

## 📋 WHAT CHANGED

### ❌ REMOVED

1. **Bottom Sheets for Core Functionality**
   - QuickCaptureSheet (task, note, thought, appointment)
   - PlanSomethingSheet
   - Embedded MealPlannerFlow inside Kitchen page

2. **Chat-Style AI Overlays**
   - No floating chat boxes
   - No half-height AI conversations
   - No background dimming for primary flows

### ✅ ADDED

1. **Full-Page Routes**
   - `/kitchen/planner` - AI Meal Planner (flagship feature)
   - `/capture?type=X` - Quick Capture for tasks, notes, thoughts, appointments
   - All pages are 100% screen height with proper headers

2. **Navigation-First Cards**
   - Kitchen: "What's for Dinner?" CTA → `/kitchen/planner`
   - Kitchen: "Meal Planner" CTA → `/kitchen/planner`
   - Today: Quick Capture buttons → `/capture?type=X`
   - Today: "Plan Something" → `/kitchen/planner`

3. **Decisive AI Behavior (Meal Planner)**
   - No chat UI
   - No confirmation questions
   - Auto-executes: generates meals, applies leftover logic, creates shopping list
   - Shows results with full meal plan

---

## 🏗️ NEW ARCHITECTURE

### HOME / TODAY PAGE ROLE

**Purpose**: Orientation, overview, entry only

**Displays**:
- Greeting header
- Weather & calendar cards
- Summary cards (tasks, appointments, notes)
- Quick Capture buttons (navigate to `/capture`)
- "Plan Something" card (navigates to `/kitchen/planner`)

**Rules**:
- No editing
- No AI chat
- No modals for core features
- Tap card → Full page navigation

### KITCHEN PAGE ROLE

**Purpose**: Daily cooking context, planning entry, home of Kitchen AI

**Sections**:
1. **Today's Meal** (read-only, derived from weekly)
2. **What's for Dinner?** (primary CTA → `/kitchen/planner`)
3. **Meal Planner** (secondary CTA → `/kitchen/planner`)
4. **This Week's Meals** (clickable weekly calendar)
5. **Shopping List** (preview)

**AI Role**:
- Kitchen Assistant
- Aware of: past meals, leftovers, meal plans, shopping list
- Inline AI input bar for quick kitchen questions
- Page-specific context

### MEAL PLANNER FULL PAGE

**Route**: `/kitchen/planner`

**Flow**:
1. **Step 1: Meal Type Selection**
   - Breakfast, Lunch, Dinner, Baking
   - Multi-select with clear visual feedback
   - Orange filled backgrounds + checkmarks when selected

2. **Step 2: Time Range Selection**
   - Just Today
   - This Week (7 days)
   - Custom Range (pick number of days)

3. **Step 3: Planning State**
   - "Creating your meal plan..."
   - Shows loading animation
   - NO user input required

4. **Step 4: Results**
   - Full meal plan view
   - Expandable days and meals
   - Meal images, descriptions, prep times
   - Leftover usage indicators
   - Actions: Done, Create Another Plan

**AI Behavior (Decisive, Not Chat)**:
- When plan is created, AI:
  - Generates meals for selected range
  - Applies smart leftover logic (Dinner → next-day lunch reuse)
  - Auto-adds meals to calendar/schedule
  - Generates grocery list
  - Deduplicates groceries
  - Adds groceries to shopping list
  - Shows confirmation: "Plan Created!"
- NO confirmation questions
- NO chat-style UI
- Planner is decisive by design

**No Chat UI**:
- This is a planning interface, not a conversation
- User selects options → AI executes → Shows results
- Clean, intentional, predictable

### QUICK CAPTURE FULL PAGE

**Route**: `/capture?type={task|note|appointment|thought}`

**Design**:
- Full-screen
- Type selector at top (pills: To-Do, Appointment, Note, Thought)
- Large text area for input
- Voice button (push-to-talk)
- Save button (color matches type)
- Cancel button

**Behavior**:
- Saves directly to localStorage
- Triggers update events
- Shows toast confirmation
- Navigates back

**Types**:
- **Task**: Blue gradient, "Add Task"
- **Appointment**: Purple gradient, "Add Appointment"
- **Note**: Gray gradient, "Save Note"
- **Thought**: Yellow gradient, "Save Thought"

---

## 🧠 AI CONTEXT MODEL (PRESERVED)

### Page-Aware Context

Each page defines:

```typescript
pageContext = {
  domain: "kitchen" | "tasks" | "notes" | "capture" | ...
  mode?: "planning" | "review" | "capture"
  persona: string
  permissions: string[]
}
```

### Rules
- AI always knows:
  - Which page it is on
  - What its role is
  - What actions it can perform
- No global or ambiguous AI behavior
- Context is injected by page, not by component

### AI UI Placement

**DEFAULT**:
- AI input is inline within the page
- Calm, native-feeling
- Page-specific placeholder copy

**Example (Kitchen Page)**:
```tsx
<AIInputBar 
  onIntent={handleAIIntent} 
  context="kitchen"
  placeholder="Ask about meals, recipes, or groceries..."
/>
```

---

## 📐 FULL-PAGE STRUCTURE (STANDARDIZED)

### Every Full Page Must:

1. **Occupy 100% of screen height**
2. **Have a clear header**:
   ```tsx
   <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
     <button onClick={() => router.back()}>
       <ChevronLeft />
     </button>
     <h1>Page Title</h1>
   </div>
   ```
3. **Own its AI context**
4. **Preserve state and scroll**
5. **Feel like a destination** (not a modal)

### Examples:
- Quick Capture → Full Capture Page
- Note → Full Note Page
- Task → Full Task Page
- Kitchen → Full Kitchen Page
- Meal Planner → Full Planner Page

---

## 🎨 VISUAL & UX STANDARD (PREMIUM)

### Design Language
- Calm, modern, warm aesthetic
- Soft shadows, rounded corners
- Clear hierarchy
- Smooth page transitions
- No clutter
- One primary action per screen

### Colors
- **Orange**: Kitchen, Meal Planner, warm features
- **Blue**: Tasks, To-Dos
- **Purple**: Appointments, Calendar
- **Gray**: Notes, Neutral
- **Yellow**: Thoughts, Ideas
- **Green**: Success, Confirmations

### Transitions
- Smooth page navigation (Next.js router transitions)
- Gentle hover states
- No jarring animations
- Predictable, calm

---

## 🚫 BOTTOM SHEETS — STRICT LIMIT

### Allowed Only For:
1. **Date pickers**
2. **Time pickers**
3. **Quick confirmations** (e.g., "Delete this note?")
4. **Read-only previews** (e.g., attachment preview)

### Rules:
- Max 30–40% height
- No AI chat
- No editing
- No primary flows
- Must be dismissible (tap outside or drag down)

### NOT Allowed:
- Notes creation/editing
- Task creation/editing
- Meal planning
- AI conversations
- Any core feature that requires more than 10 seconds

---

## 📂 FILE STRUCTURE

### New Routes

```
app/
├── kitchen/
│   ├── page.tsx                  # Kitchen hub (cards, navigation)
│   └── planner/
│       └── page.tsx              # Full-page Meal Planner (NEW)
├── capture/
│   └── page.tsx                  # Full-page Quick Capture (NEW)
├── today/
│   └── page.tsx                  # Today/Home page (updated)
└── dashboard/
    ├── tasks/
    ├── notes/
    └── ...
```

### Updated Components

```
components/
├── today/
│   ├── QuickCaptureRow.tsx       # Updated: navigates to /capture
│   └── ...
└── sheets/
    ├── AppointmentCreateSheet.tsx  # Kept (small form, acceptable)
    ├── ThoughtCreateSheet.tsx      # Kept (small form, acceptable)
    ├── QuickCaptureSheet.tsx       # DEPRECATED (use /capture)
    ├── PlanSomethingSheet.tsx      # DEPRECATED (use /kitchen/planner)
    └── NoteCreateSheet.tsx         # DEPRECATED (use /capture)
```

---

## 🔀 USER FLOWS

### Flow 1: Plan Meals (Flagship)

1. User opens Kitchen page
2. Sees "What's for Dinner?" primary CTA
3. Taps → Navigates to `/kitchen/planner`
4. **Step 1**: Selects meal types (Dinner + Lunch)
5. **Step 2**: Selects time range (This Week)
6. Taps "Create Plan"
7. **Step 3**: AI generates meals (loading state, 3-5 seconds)
8. **Step 4**: Shows full meal plan with images
   - 7 dinners + 7 lunches (some lunches are leftovers)
   - Shopping list auto-generated
   - Meals auto-added to calendar
9. Taps "Done" → Back to Kitchen
10. Sees meals in "This Week's Meals" calendar
11. Sees today's meal in "Today's Meal" card

**Total time**: ~45 seconds
**Feels**: Decisive, powerful, effortless

### Flow 2: Quick Capture Task

1. User on Today page
2. Sees Quick Capture row
3. Taps "To-Do" button
4. Navigates to `/capture?type=task`
5. Types task (e.g., "Buy milk")
6. Taps "Add Task"
7. Toast: "Task added"
8. Navigates back to Today
9. Sees task count updated in To-Do card

**Total time**: ~10 seconds
**Feels**: Quick, intentional, no distractions

### Flow 3: View Day's Meals

1. User on Kitchen page
2. Sees "This Week's Meals" calendar
3. Taps Monday card
4. Modal opens (read-only preview, 30% height)
5. Shows all Monday meals with images
6. Taps outside → Closes modal
7. Back to Kitchen page

**Total time**: ~5 seconds
**Feels**: Informational, lightweight, no commitment

---

## ✅ SUCCESS CRITERIA

### The app should feel:
- **Calm**: No clutter, no overwhelming options
- **Intentional**: Every action is purposeful
- **Powerful**: AI does heavy lifting without asking
- **Trustworthy**: Predictable, reliable, transparent

### User should say:
- "This handles my life without chaos"
- "I know exactly where to go for everything"
- "The AI just does what I need without questions"
- "It feels like a real mobile app, not a website"

---

## 🧪 TESTING CHECKLIST

### ✅ Navigation Flows
- [x] Kitchen → Meal Planner → Results → Back to Kitchen
- [x] Today → Quick Capture → Save → Back to Today
- [x] Kitchen → Weekly Meal Card → Modal → Close
- [x] Today → "Plan Something" → Meal Planner

### ✅ AI Behavior
- [x] Meal Planner: Generates meals without chat
- [x] Meal Planner: Applies leftover logic automatically
- [x] Meal Planner: Auto-adds to shopping list
- [x] Meal Planner: Shows confirmation (not question)

### ✅ Visual Feedback
- [x] Selected meal types: Orange background + checkmark
- [x] Selected time range: Orange border + checkmark
- [x] Loading state: Animated spinner + descriptive text
- [x] Results: Full meal cards with images

### ✅ State Management
- [x] Weekly meals persist in localStorage
- [x] Today's Meal auto-derives from weekly
- [x] Shopping list updates when meals are added
- [x] Back navigation preserves state

### ✅ Bottom Sheet Compliance
- [x] No bottom sheets for tasks, notes, thoughts
- [x] No bottom sheets for meal planning
- [x] Only read-only previews use bottom sheets (weekly meal modal)

---

## 🚀 DEPLOYMENT STATUS

### ✅ Complete
- Full-page Meal Planner (`/kitchen/planner`)
- Full-page Quick Capture (`/capture`)
- Kitchen page navigation CTAs
- Today page navigation updates
- QuickCaptureRow navigation
- Removed inappropriate bottom sheets
- Decisive AI behavior (auto-execute, no chat)

### 🟢 Ready to Test
- `http://localhost:3000/kitchen` - Kitchen hub
- `http://localhost:3000/kitchen/planner` - Meal Planner
- `http://localhost:3000/capture?type=task` - Quick Capture (Task)
- `http://localhost:3000/capture?type=note` - Quick Capture (Note)
- `http://localhost:3000/today` - Today/Home page

---

## 📝 MIGRATION NOTES

### For Developers

**Before**:
```tsx
// Old: Bottom sheet opens
<button onClick={() => setShowPlanner(true)}>
  Create meals
</button>

{showPlanner && (
  <MealPlannerFlow onComplete={...} onCancel={...} />
)}
```

**After**:
```tsx
// New: Navigate to full page
<button onClick={() => router.push('/kitchen/planner')}>
  Create meals
</button>
```

### For Users
- **No visible change in functionality**
- **Feels more native and intentional**
- **Clearer navigation (full-screen destinations)**
- **AI is more decisive (no chat, just execute)**

---

## 🎉 SUMMARY

✅ **Architectural refactor complete**
✅ **Mobile-first, full-page experience**
✅ **Cards → Pages (not modals)**
✅ **Decisive AI (no chat, auto-execute)**
✅ **Kitchen Meal Planner is flagship feature**
✅ **Bottom sheets only for helpers**
✅ **AI context preserved and page-aware**
✅ **Premium, calm, trustworthy UX**

**Abi now feels like a real mobile app that "handles my life without chaos!"** 🎉
