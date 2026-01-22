# AI Architecture Alignment - Abi's GPT-Level Capabilities

## Current State Audit

### ✅ AI Foundation (Already in Place)

**1. GPT Reasoning Engine**
- Location: `ai/gptReasoning.ts`
- Capabilities:
  - ✅ GPT-4o-mini with vision support (multimodal)
  - ✅ Natural language understanding
  - ✅ Proactive execution (act first, ask later)
  - ✅ Image analysis via GPT Vision API
  - ✅ Conversational responses

**2. Intent Classification & Routing**
- Location: `ai/aiRouter.ts`, `app/api/ai/classify/route.ts`
- Flow: User Input → GPT Reasoning → Intent → Domain Handler → Execution
- Supports: tasks, appointments, reminders, meals, shopping, family, pets

**3. Domain Handlers**
- Location: `ai/handlers/`
- Current handlers:
  - ✅ `tasksHandler.ts` - Creates tasks in localStorage
  - ✅ `appointmentsHandler.ts` - Creates appointments in localStorage
  - ✅ `remindersHandler.ts` - Creates reminders (as tasks)
  - ✅ `mealsHandler.ts` - Meal planning
  - ✅ `shoppingHandler.ts` - Shopping lists
  - ✅ `familyHandler.ts` - Family members
  - ✅ `petsHandler.ts` - Pet management

**4. Data Persistence**
- Current: localStorage (all handlers)
- Future: Supabase (schema exists, ready for migration)
- Event system: Custom events (`tasksUpdated`, `appointmentsUpdated`, `notesUpdated`)

### ✅ UI Components (Already Rendering)

**Today Page (`app/today/page.tsx`)**
- ✅ GreetingHeader
- ✅ MoodBar
- ✅ AIFocusHeader
- ✅ WeatherCard
- ✅ CalendarCard (full calendar with events)
- ✅ NowCard (urgent tasks + next appointment)
- ✅ Summary Cards (To-Do, Appointments, Notes, Reminders)
- ✅ QuickCaptureRow (Thoughts, Tasks, Reminders, Appointments, Notes)
- ✅ PlanSomethingSheet
- ✅ CareCard
- ✅ GlanceBar

**Document Upload (`components/documents/DocumentUpload.tsx`)**
- ✅ Camera capture with `getUserMedia`
- ✅ File upload
- ✅ PDF/Image format toggle
- ✅ Modal with proper viewport constraints (`max-h-[90vh]`)
- ✅ Scrollable content area
- ✅ Fixed action buttons

### 🔧 Gaps Identified

**1. Multimodal Image Analysis Flow**
- ✅ GPT Vision API is wired up
- ✅ Images can be sent to classify API
- ❓ Need to verify: Camera capture → AI analysis → Action suggestion flow
- ❓ Need to verify: Document scan → Classify → Store → Retrieve flow

**2. Long Context / Suggestions**
- ✅ GPT reasoning supports context parameter
- ❓ Need to enhance: Context accumulation in conversations
- ❓ Need to enhance: Proactive suggestions based on data patterns

**3. Domain Architecture Mapping**
- ✅ Domains registry exists (`domains/registry.ts`)
- ❓ Need to map: Domain capabilities (data ownership, actions, UI components)
- ❓ Need to enhance: Domain-specific AI actions

**4. Action Confirmations**
- ✅ Handlers execute immediately (proactive)
- ❓ Need to add: Confirmation prompts for irreversible actions
- ❓ Need to add: Undo/redo capability

## Target Architecture: Intent → Domain → Capability → Execution

### Domain Structure

```
Today Domain
  ├─ Data: Tasks, Appointments, Notes, Thoughts, Calendar
  ├─ Actions: Create, Update, Delete, Complete
  └─ UI: Today page, cards, quick capture

Kitchen Domain
  ├─ Data: Recipes, Ingredients, Meals, Pantry, Shopping Lists
  ├─ Actions: Plan meals, Add items, Generate shopping lists
  └─ UI: Kitchen pages, recipe cards, pantry list

Home Domain
  ├─ Data: Tasks, Calendar, Smart devices
  ├─ Actions: Manage home, control devices
  └─ UI: Home dashboard

People Domain
  ├─ Data: Family members, Pets, Contacts
  ├─ Actions: Add members, Manage relationships
  └─ UI: People pages

Office Domain
  ├─ Data: Documents, Faxes, Bills, Insurance
  ├─ Actions: Upload, Scan, Organize, Send
  └─ UI: Office pages, document viewer

Finance Domain
  ├─ Data: Budgets, Bills, Transactions, Subscriptions
  ├─ Actions: Track expenses, Manage bills
  └─ UI: Finance dashboard

Care Domain
  ├─ Data: Health, Medications, Appointments
  ├─ Actions: Track health, Manage care
  └─ UI: Care pages
```

### AI Action Flow

```
1. User Input (text/image/voice)
   ↓
2. GPT Reasoning (analyze intent, extract data, infer defaults)
   ↓
3. Intent Classification (task, appointment, note, etc.)
   ↓
4. Domain Router (route to appropriate domain handler)
   ↓
5. Handler Execution (create/update/delete data)
   ↓
6. UI Update (trigger events, refresh components)
   ↓
7. User Feedback (confirmation message, success/error)
```

### Multimodal Examples Supported

**1. Upload Fridge Photo → Analyze → Suggest Meals**
```
User: [uploads fridge photo]
  → GPT Vision analyzes contents
  → Suggests recipes based on available ingredients
  → User approves → Creates meal plan + shopping list
```

**2. Upload Room Photo → Organization Suggestions**
```
User: [uploads messy room photo]
  → GPT Vision analyzes organization needs
  → Suggests tasks: "Organize desk", "Put away clothes"
  → User approves → Creates tasks
```

**3. Voice/Text Command → Calendar Creation**
```
User: "Dentist appointment tomorrow at 3pm"
  → GPT extracts: title, date (tomorrow), time (15:00)
  → Creates appointment immediately
  → Confirms: "I've scheduled your dentist appointment for tomorrow at 3 PM."
```

**4. Document Scan → Classify → Store**
```
User: [scans document with camera]
  → Saves as PDF/image
  → GPT analyzes document type (bill, insurance, etc.)
  → Suggests category and metadata
  → Stores in Office domain
```

## Implementation Status

### ✅ Completed
- GPT reasoning engine with vision
- Intent classification and routing
- Domain handlers for all core actions
- Today page with all widgets
- Document upload with camera
- Event system for UI updates

### 🔄 In Progress / Needs Verification
- Image → Action flow (camera → AI → task creation)
- Long context accumulation
- Proactive suggestions
- Action confirmations for irreversible operations

### 📋 Next Steps
1. Test multimodal flow end-to-end (image → AI → action)
2. Enhance context accumulation in conversations
3. Add confirmation prompts for deletions/modifications
4. Map domain capabilities to AI actions
5. Add undo/redo support

## Constraints Respected

✅ **Supabase**: Not removed, ready for future migration
✅ **UI**: No redesign, restoring existing components
✅ **Components**: All preserved, only fixes applied
✅ **Auth**: Dev bypass maintained (as requested)

## Notes

- All handlers currently use localStorage (dev mode)
- Supabase schema exists and is ready for production migration
- AI actions are proactive (execute immediately with defaults)
- GPT Vision is fully integrated for image analysis
- Event system ensures UI updates when data changes
