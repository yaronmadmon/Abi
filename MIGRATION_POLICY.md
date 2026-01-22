# Migration Policy - Data Hooks

**Status:** ACTIVE - Enforced from January 21, 2026  
**Applies to:** All files touched after Phase 2 completion

---

## The Rule (Non-Negotiable)

**Any file touched from today forward MUST use data hooks. No exceptions.**

If you open a file with legacy localStorage pattern, you MUST migrate it to data hooks before adding your feature.

---

## Why This Matters

Without this rule, the codebase will bifurcate:
- Some pages use new hooks (maintainable, future-proof)
- Some pages use old pattern (technical debt)
- Patterns diverge over time
- Migration becomes impossible

**This rule keeps the codebase converging, not diverging.**

---

## How to Detect Legacy Pattern

### Legacy Pattern (MUST MIGRATE):
```typescript
// ❌ OLD - Direct localStorage access
const [tasks, setTasks] = useState<Task[]>([])

useEffect(() => {
  const stored = localStorage.getItem('tasks')
  if (stored) setTasks(JSON.parse(stored))
}, [])

const saveTasks = (newTasks: Task[]) => {
  localStorage.setItem('tasks', JSON.stringify(newTasks))
  setTasks(newTasks)
  window.dispatchEvent(new Event('tasksUpdated'))
}
```

### New Pattern (CORRECT):
```typescript
// ✅ NEW - Data hooks
import { useTasksData } from '@/hooks/data/useTasksData'

const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasksData()
```

---

## Migration Checklist

When you touch a file with legacy pattern:

```
☐ 1. Identify the data type (tasks, notes, meals, etc.)
☐ 2. Import the appropriate hook from hooks/data/
☐ 3. Replace useState + useEffect with hook
☐ 4. Replace manual save functions with hook methods
☐ 5. Remove localStorage.getItem/setItem calls
☐ 6. Remove manual event dispatching
☐ 7. Add loading/error states (if needed)
☐ 8. Test the page works correctly
☐ 9. Verify data persists after refresh
```

**Time required:** 15-30 minutes per file

---

## Available Data Hooks

```typescript
// Tasks
import { useTasksData } from '@/hooks/data/useTasksData'
// Provides: tasks, isLoading, error, addTask, updateTask, deleteTask, toggleTask

// Notes
import { useNotesData } from '@/hooks/data/useNotesData'
// Provides: notes, isLoading, error, addNote, updateNote, deleteNote, togglePin

// Meals
import { useMealsData } from '@/hooks/data/useMealsData'
// Provides: meals, isLoading, error, addMeal, updateMeal, deleteMeal

// Shopping
import { useShoppingData } from '@/hooks/data/useShoppingData'
// Provides: items, isLoading, error, addItem, updateItem, deleteItem, toggleItem, clearChecked

// Appointments
import { useAppointmentsData } from '@/hooks/data/useAppointmentsData'
// Provides: appointments, isLoading, error, addAppointment, updateAppointment, deleteAppointment

// Reminders
import { useRemindersData } from '@/hooks/data/useRemindersData'
// Provides: reminders, isLoading, error, saveReminder, updateReminder, deleteReminder

// Family
import { useFamilyData } from '@/hooks/data/useFamilyData'
// Provides: family, isLoading, error, addFamilyMember, updateFamilyMember, deleteFamilyMember

// Pets
import { usePetsData } from '@/hooks/data/usePetsData'
// Provides: pets, isLoading, error, addPet, updatePet, deletePet
```

---

## Known Legacy Files (Need Migration)

High priority:
```
- app/dashboard/tasks/page.tsx
- app/dashboard/notes/page.tsx
- app/dashboard/shopping/page.tsx
- app/kitchen/page.tsx
- app/kitchen/planner/page.tsx
```

Medium priority:
```
- app/today/page.tsx
- app/people/family/page.tsx
- app/people/pets/page.tsx
- components/today/NowCard.tsx (uses tasks)
- components/today/CalendarCard.tsx (uses appointments + tasks)
```

**If you touch any of these files, migrate them first.**

---

## Examples

### Example 1: Adding a feature to tasks page

**Wrong approach:**
```typescript
// ❌ BAD - Added feature using legacy pattern
const addPriority = (id: string, priority: string) => {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
  const updated = tasks.map(t => t.id === id ? { ...t, priority } : t)
  localStorage.setItem('tasks', JSON.stringify(updated))
}
```

**Correct approach:**
```typescript
// ✅ GOOD - Migrate to hooks first, then add feature
import { useTasksData } from '@/hooks/data/useTasksData'

const { tasks, updateTask } = useTasksData()

const addPriority = async (id: string, priority: string) => {
  await updateTask(id, { priority })
}
```

---

### Example 2: Bug fix in notes page

**Wrong approach:**
```typescript
// ❌ BAD - Fixed bug but left legacy pattern
const deleteNote = (id: string) => {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]')
  const filtered = notes.filter(n => n.id !== id)
  localStorage.setItem('notes', JSON.stringify(filtered))
  setNotes(filtered)  // BUG FIX: Added this line
}
```

**Correct approach:**
```typescript
// ✅ GOOD - Migrate to hooks, bug is automatically fixed
import { useNotesData } from '@/hooks/data/useNotesData'

const { notes, deleteNote } = useNotesData()
// Bug already fixed in hook implementation
```

---

## Enforcement

### During Code Review:
- Check for `localStorage.getItem` or `localStorage.setItem`
- If found: Request migration to data hooks
- No merge until migrated

### During Development:
- Before touching a file: Check for legacy pattern
- If found: Migrate first (15-30 min)
- Then add your feature

### ESLint Rule (Future):
```javascript
// Could add custom rule to warn on localStorage usage
'no-restricted-globals': ['warn', {
  name: 'localStorage',
  message: 'Use data hooks from hooks/data/ instead of direct localStorage'
}]
```

---

## Benefits of This Policy

**For the codebase:**
- ✅ Consistent patterns everywhere
- ✅ Easy Supabase migration (change 1 line)
- ✅ Better error handling
- ✅ Automatic loading states
- ✅ Centralized data logic

**For developers:**
- ✅ Less boilerplate to write
- ✅ Copy-paste from existing hooks
- ✅ Fewer bugs (logic is tested once)
- ✅ Clear migration path

**For the future:**
- ✅ Technical debt decreases over time
- ✅ Codebase converges to best pattern
- ✅ Onboarding easier (one pattern to learn)

---

## Migration Guide Reference

Full guide: `PHASE_2_DATA_MIGRATION_PATTERN.md`

Quick reference:
1. Import hook
2. Replace state with hook destructuring
3. Remove localStorage calls
4. Remove manual events
5. Test

**Time:** 15-30 minutes per file  
**Benefit:** Permanent improvement

---

## Status Tracking

### Migrated Files:
```
☐ app/dashboard/tasks/page.tsx
☐ app/dashboard/notes/page.tsx
☐ app/dashboard/shopping/page.tsx
☐ app/kitchen/page.tsx
☐ app/kitchen/planner/page.tsx
☐ app/today/page.tsx
☐ app/people/family/page.tsx
☐ app/people/pets/page.tsx
☐ components/today/NowCard.tsx
☐ components/today/CalendarCard.tsx
```

As files are migrated, check them off here.

---

## Exception Process

**Q: What if I really can't migrate right now?**

**A:** There are NO exceptions to this rule. If you touch a file, you migrate it.

**Rationale:** 
- Migration takes 15-30 min
- Your feature probably takes longer
- You're already in the file
- Leaving it unmigrated adds technical debt
- Future-you will thank present-you

**If truly blocked:** Create a GitHub issue explaining why, get team approval, then proceed. But this should be rare (< 1% of cases).

---

## Policy Review

**Review date:** Every 3 months  
**Success metric:** % of files using data hooks  
**Target:** 100% of active files by end of 2026

**This policy is ACTIVE and ENFORCED starting today.**
