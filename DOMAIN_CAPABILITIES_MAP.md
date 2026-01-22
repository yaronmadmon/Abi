# Domain Capabilities Map - Architecture Alignment

## Overview

This document maps the existing app structure to the domain architecture concept, showing what data each domain owns, what actions it allows, and how AI can orchestrate across domains.

**Note:** The app uses routes `/today`, `/home`, `/kitchen`, etc. (frozen UX), while `domains/registry.ts` defines `/dashboard/*` routes (future structure). This mapping bridges both.

---

## Today Domain

**Routes:** `/today`  
**UI Components:** `app/today/page.tsx`, `components/today/*`

### Data Ownership
- Tasks (via `tasks` localStorage key)
- Appointments (via `appointments` localStorage key)
- Notes (via `notes` localStorage key)
- Thoughts (via `thoughts` localStorage key)
- Calendar events (derived from tasks + appointments)

### Actions Available
- ✅ Create task (`tasksHandler.create`)
- ✅ Create appointment (`appointmentsHandler.create`)
- ✅ Create reminder (`remindersHandler.create` → stored as task)
- ✅ Create note (direct localStorage + `notesUpdated` event)
- ✅ Create thought (direct localStorage + `thoughtsUpdated` event)
- ✅ View urgent items (NowCard)
- ✅ Quick capture (QuickCaptureRow)

### AI Integration
- **Current:** GPT reasoning → Intent → Handler → Execution
- **Flow:** User input → `/api/ai/classify` → `routeIntent` → Domain handler → localStorage → Event dispatch → UI update
- **Status:** ✅ Fully functional

### UI Components
- GreetingHeader, MoodBar, AIFocusHeader
- WeatherCard, CalendarCard
- NowCard (urgent tasks + next appointment)
- Summary Cards (To-Do, Appointments, Notes, Reminders)
- QuickCaptureRow (Thoughts, Tasks, Reminders, Appointments, Notes)
- PlanSomethingSheet
- CareCard, GlanceBar

---

## Kitchen Domain

**Routes:** `/kitchen`, `/dashboard/shopping`, `/dashboard/meals`  
**UI Components:** `app/kitchen/*`, `app/dashboard/shopping/*`, `app/dashboard/meals/*`

### Data Ownership
- Meals (via `meals` localStorage key)
- Shopping items (via `shopping` localStorage key)
- Recipes (future: Supabase `recipes` table)
- Pantry items (future: Supabase `pantry` table)
- Ingredients (future: Supabase `ingredients` table)

### Actions Available
- ✅ Create meal (`mealsHandler.create`)
- ✅ Create shopping item (`shoppingHandler.create`)
- 🔄 Plan meals (UI exists, needs handler)
- 🔄 Add to pantry (UI exists, needs handler)
- 🔄 Save recipe (UI exists, needs handler)

### AI Integration
- **Current:** `mealsHandler`, `shoppingHandler` → localStorage → Event dispatch
- **Future:** Image analysis (fridge photo → suggest meals → add shopping items)
- **Status:** ✅ Handlers functional, multimodal flow ready for implementation

### UI Components
- Kitchen page (`app/kitchen/page.tsx`)
- Shopping list (`app/dashboard/shopping/page.tsx`)
- Meals (`app/dashboard/meals/page.tsx`)
- Pantry (`app/kitchen/pantry/page.tsx`)
- Recipes (`app/kitchen/recipes/page.tsx`)

---

## Home Domain

**Routes:** `/home`, `/dashboard/tasks`, `/dashboard/weekly`  
**UI Components:** `app/home/*`, `app/dashboard/tasks/*`

### Data Ownership
- Tasks (shared with Today domain)
- Calendar events (shared with Today domain)
- Smart devices (future: Supabase `devices` table)
- Home profiles (future: Supabase `home_profiles` table)

### Actions Available
- ✅ Create task (`tasksHandler.create`)
- ✅ Create appointment (`appointmentsHandler.create`)
- 🔄 Control smart devices (UI exists, needs handler)
- 🔄 View weekly overview (`app/dashboard/weekly/page.tsx`)

### AI Integration
- **Current:** Same as Today domain (shared handlers)
- **Status:** ✅ Functional

### UI Components
- Home page (`app/home/page.tsx`)
- Tasks list (`app/dashboard/tasks/page.tsx`)
- Calendar (`app/home/calendar/page.tsx`)
- Weekly overview (`app/dashboard/weekly/page.tsx`)
- Smart home (`app/home/smart/page.tsx`)

---

## Office Domain

**Routes:** `/office`, `/office/fax`, `/office/documents`  
**UI Components:** `app/office/*`, `components/documents/*`

### Data Ownership
- Documents (via `documents` localStorage key, future: Supabase `documents` table)
- Faxes (via `faxes` localStorage key, future: Supabase `faxes` table)
- Bills (future: Supabase `bills` table)
- Insurance documents (future: Supabase `insurance` table)

### Actions Available
- ✅ Upload document (`DocumentUpload` component → localStorage)
- ✅ Scan document (camera capture → PDF/image → `DocumentUpload`)
- ✅ Send fax (Fax page → localStorage)
- 🔄 Classify document (GPT Vision can analyze, needs handler)
- 🔄 Extract text (future: OCR + GPT)

### AI Integration
- **Current:** Document upload working, camera + PDF/image toggle functional
- **Future:** 
  - Image analysis (document scan → classify → suggest metadata → store)
  - OCR integration (extract text → create note/task)
- **Status:** ✅ Upload functional, multimodal analysis ready

### UI Components
- Office page (`app/office/page.tsx`)
- Fax (`app/office/fax/page.tsx`)
- Documents (`app/office/documents/page.tsx`)
- DocumentUpload (`components/documents/DocumentUpload.tsx`)
- DocumentViewer (`components/documents/DocumentViewer.tsx`)
- Scanner (`app/office/scanner/page.tsx`)
- Archive (`app/office/archive/page.tsx`)

---

## Finance Domain

**Routes:** `/finance`  
**UI Components:** `app/finance/*`

### Data Ownership
- Bills (future: Supabase `bills` table)
- Budgets (future: Supabase `budgets` table)
- Transactions (future: Supabase `transactions` table)
- Subscriptions (future: Supabase `subscriptions` table)

### Actions Available
- 🔄 Track expenses (UI exists, needs handler)
- 🔄 Manage bills (UI exists, needs handler)
- 🔄 Set budgets (UI exists, needs handler)
- 🔄 Manage subscriptions (UI exists, needs handler)

### AI Integration
- **Current:** No handlers yet
- **Future:** 
  - Bill analysis (scan bill → extract amount, due date → create task/reminder)
  - Budget suggestions (analyze spending → suggest budget adjustments)
- **Status:** 🔄 UI exists, handlers needed

### UI Components
- Finance page (`app/finance/page.tsx`)
- Bills (`app/finance/bills/page.tsx`)
- Budget (`app/finance/budget/page.tsx`)
- Transactions (`app/finance/transactions/page.tsx`)
- Subscriptions (`app/finance/subscriptions/page.tsx`)

---

## People Domain

**Routes:** `/people`  
**UI Components:** `app/people/*`

### Data Ownership
- Family members (via `family` localStorage key, `familyHandler`)
- Pets (via `pets` localStorage key, `petsHandler`)
- Applicants (future: Supabase `applicants` table)

### Actions Available
- ✅ Create family member (`familyHandler.create`)
- ✅ Create pet (`petsHandler.create`)
- 🔄 Manage relationships (UI exists, needs handler)
- 🔄 Track care tasks (future: tasks linked to people)

### AI Integration
- **Current:** `familyHandler`, `petsHandler` → localStorage
- **Status:** ✅ Handlers functional

### UI Components
- People page (`app/people/page.tsx`)
- Family (`app/people/family/page.tsx`)
- Pets (`app/people/pets/page.tsx`)
- Applicants (`app/people/applicants/page.tsx`)

---

## Care Domain (Implicit - Not Separate Route)

**Routes:** Integrated into Today/Home  
**UI Components:** `components/today/CareCard.tsx`

### Data Ownership
- Self-care moments (via `care` localStorage key)
- Health tracking (future: Supabase `health` table)
- Medications (future: Supabase `medications` table)

### Actions Available
- ✅ Reset/self-care moment (CareCard)
- 🔄 Track health (future)
- 🔄 Medication reminders (future: linked to reminders)

### AI Integration
- **Current:** CareCard provides quick reset
- **Future:** Health suggestions based on patterns
- **Status:** ✅ Basic care card functional

---

## Cross-Domain AI Orchestration Examples

### Example 1: Fridge Photo → Meal Planning
```
User: [uploads fridge photo]
  → GPT Vision analyzes contents
  → Kitchen domain: Suggests recipes
  → Kitchen domain: Creates meal plan
  → Kitchen domain: Generates shopping list (missing items)
  → Today domain: Creates shopping reminder task
```

### Example 2: Document Scan → Organization
```
User: [scans bill document]
  → GPT Vision analyzes (bill amount, due date, vendor)
  → Office domain: Classifies as "bill"
  → Finance domain: Creates bill entry
  → Today domain: Creates reminder task (due date)
  → Office domain: Stores document with metadata
```

### Example 3: Room Photo → Task Creation
```
User: [uploads messy room photo]
  → GPT Vision analyzes organization needs
  → Today domain: Suggests tasks ("Organize desk", "Put away clothes")
  → User approves → Today domain: Creates tasks
```

### Example 4: Voice Command → Multi-Domain
```
User: "Plan dinner for tomorrow with ingredients we have"
  → GPT reasons: meal planning + shopping
  → Kitchen domain: Analyzes pantry
  → Kitchen domain: Suggests recipe based on available ingredients
  → Kitchen domain: Creates meal plan
  → Kitchen domain: Generates shopping list for missing items
  → Today domain: Creates shopping reminder
```

---

## Handler Status Summary

### ✅ Implemented (with localStorage + events)
- `tasksHandler` - Tasks, reminders
- `appointmentsHandler` - Appointments, calendar
- `mealsHandler` - Meal planning
- `shoppingHandler` - Shopping lists
- `familyHandler` - Family members
- `petsHandler` - Pet management

### 🔄 UI Exists, Handlers Needed
- Finance handlers (bills, budgets, transactions, subscriptions)
- Pantry/ingredients handlers
- Recipe handlers
- Document classification handlers

### 🔄 Future Enhancements
- Cross-domain orchestration helpers
- Confirmation prompts for destructive actions
- Undo/redo capability
- Long context accumulation for suggestions

---

## Data Storage Strategy

**Current (Dev Mode):**
- All data in `localStorage` (client-side)
- Events: `tasksUpdated`, `appointmentsUpdated`, `notesUpdated`, `thoughtsUpdated`, `shoppingUpdated`, `mealsUpdated`

**Future (Production):**
- Migrate to Supabase tables (schema exists)
- Keep event system for real-time UI updates
- Add Supabase real-time subscriptions

---

## AI Action Flow (Current Implementation)

```
1. User Input (text/image/voice)
   ↓
2. GPT Reasoning (`reasonWithGPT`)
   - Analyzes intent
   - Extracts data
   - Infers defaults
   ↓
3. Intent Classification (`convertReasoningToIntent`)
   - Maps GPT action → AIIntent type
   - Validates required fields
   ↓
4. Domain Router (`routeIntent`)
   - Routes to appropriate handler
   ↓
5. Handler Execution (e.g., `tasksHandler.create`)
   - Saves to localStorage
   - Triggers update event
   ↓
6. UI Update
   - Components listen to events
   - Re-render with new data
   ↓
7. User Feedback
   - Success message
   - Error handling
```

---

## Next Steps for Full Orchestration

1. **Implement missing handlers** (Finance, Pantry, Recipes, Document classification)
2. **Add cross-domain helpers** (e.g., `orchestrateMealPlanning`, `orchestrateDocumentProcessing`)
3. **Enhance GPT prompts** with domain context awareness
4. **Add confirmation flows** for multi-step actions
5. **Migrate to Supabase** when ready for production
