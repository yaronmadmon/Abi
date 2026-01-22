# Phase 2: Data Migration Pattern

**Status:** Infrastructure Complete, Migration Pattern Established  
**Next Step:** Apply pattern to all pages with localStorage

---

## What Was Built

### Storage Infrastructure ✅
- `lib/storage/types.ts` - Type definitions and interfaces
- `lib/storage/LocalStorageAdapter.ts` - localStorage wrapper with metadata
- `lib/storage/SupabaseAdapter.ts` - Placeholder for future Supabase
- `lib/storage/index.ts` - Exports active adapter

### Data Hooks ✅
- `hooks/data/useTasksData.ts`
- `hooks/data/useNotesData.ts`
- `hooks/data/useMealsData.ts`
- `hooks/data/useShoppingData.ts`
- `hooks/data/useAppointmentsData.ts`
- `hooks/data/useRemindersData.ts`
- `hooks/data/useFamilyData.ts`
- `hooks/data/usePetsData.ts`

---

## Migration Pattern

### Before (Direct localStorage):
```typescript
'use client'
import { useState, useEffect } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      setTasks(JSON.parse(stored))
    }
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(newTasks))
    setTasks(newTasks)
    window.dispatchEvent(new Event('tasksUpdated'))
  }

  const addTask = (task: Task) => {
    saveTasks([...tasks, task])
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  // ... rest of component
}
```

### After (Using Data Hook):
```typescript
'use client'
import { useTasksData } from '@/hooks/data/useTasksData'

export default function TasksPage() {
  const {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  } = useTasksData()

  // Component logic is much simpler now!
  // No useEffect for loading
  // No manual localStorage calls
  // No manual event dispatching

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // ... rest of component
}
```

---

## Benefits

### Before vs After Comparison:

| Aspect | Before (localStorage) | After (Data Hooks) |
|--------|----------------------|-------------------|
| **Lines of code** | ~50 lines | ~15 lines |
| **Loading state** | Manual | Automatic |
| **Error handling** | Manual try-catch | Automatic |
| **Event dispatching** | Manual | Automatic |
| **Metadata** | None | Versioning, timestamps, source |
| **Future-proof** | Hard to migrate | Change 1 line in hook |

---

## Pages That Need Migration

### Critical Pages (High Priority):
```
☐ app/dashboard/tasks/page.tsx
☐ app/dashboard/notes/page.tsx
☐ app/dashboard/shopping/page.tsx
☐ app/kitchen/page.tsx
☐ app/kitchen/planner/page.tsx
```

### Important Pages (Medium Priority):
```
☐ app/today/page.tsx
☐ app/people/family/page.tsx
☐ app/people/pets/page.tsx
☐ app/dashboard/meals/page.tsx
```

### Secondary Pages (Lower Priority):
```
☐ components/today/NowCard.tsx (uses tasks)
☐ components/today/CalendarCard.tsx (uses appointments + tasks)
☐ Any other component with localStorage.getItem()
```

---

## Step-by-Step Migration Guide

### For each page:

1. **Read the current page**
   ```bash
   # Identify localStorage calls
   grep -n "localStorage" app/dashboard/tasks/page.tsx
   ```

2. **Import the appropriate hook**
   ```typescript
   import { useTasksData } from '@/hooks/data/useTasksData'
   ```

3. **Replace state declarations**
   ```typescript
   // Remove these:
   // const [tasks, setTasks] = useState<Task[]>([])
   
   // Add this:
   const { tasks, isLoading, error, addTask, deleteTask } = useTasksData()
   ```

4. **Remove manual loading**
   ```typescript
   // Remove this:
   // useEffect(() => {
   //   const stored = localStorage.getItem('tasks')
   //   if (stored) setTasks(JSON.parse(stored))
   // }, [])
   
   // Hook handles it automatically!
   ```

5. **Remove manual saving**
   ```typescript
   // Remove this:
   // const saveTasks = (newTasks: Task[]) => {
   //   localStorage.setItem('tasks', JSON.stringify(newTasks))
   //   setTasks(newTasks)
   //   window.dispatchEvent(new Event('tasksUpdated'))
   // }
   
   // Hook provides saveTasks, addTask, updateTask, deleteTask!
   ```

6. **Update component logic**
   ```typescript
   // Old way:
   const handleAdd = () => {
    const newTask = { id: '...', title: '...' }
     saveTasks([...tasks, newTask])
   }
   
   // New way:
   const handleAdd = async () => {
     const newTask = { id: '...', title: '...' }
     await addTask(newTask)
   }
   ```

7. **Add loading/error states**
   ```typescript
   if (isLoading) return <div>Loading tasks...</div>
   if (error) return <div>Error loading tasks</div>
   ```

8. **Test the page**
   - Page loads correctly
   - Data persists
   - Updates work
   - No console errors

9. **Verify metadata**
   ```javascript
   // In console:
   JSON.parse(localStorage.getItem('tasks'))
   // Should show: { data: [...], metadata: { version, lastModified, source } }
   ```

---

## Example: Tasks Page Migration

### Full Before/After:

**Before (`app/dashboard/tasks/page.tsx` - lines 1-42):**
```typescript
const [tasks, setTasks] = useState<Task[]>([])

useEffect(() => {
  loadTasks()
}, [])

const loadTasks = () => {
  try {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      setTasks(JSON.parse(stored))
    }
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const saveTasks = (newTasks: Task[]) => {
  localStorage.setItem('tasks', JSON.stringify(newTasks))
  setTasks(newTasks)
  window.dispatchEvent(new Event('tasksUpdated'))
}

const addTask = (title: string, category: string) => {
  const task = { id: Date.now().toString(), title, category, completed: false }
  saveTasks([...tasks, task])
}

const deleteTask = (id: string) => {
  saveTasks(tasks.filter(t => t.id !== id))
}
```

**After (migrated):**
```typescript
import { useTasksData } from '@/hooks/data/useTasksData'

const {
  tasks,
  isLoading,
  error,
  addTask: addTaskToStorage,
  deleteTask: deleteTaskFromStorage,
  toggleTask
} = useTasksData()

// That's it! All the loading, saving, and event dispatching is handled.

const addTask = async (title: string, category: string) => {
  const task = { 
    id: Date.now().toString(), 
    title, 
    category, 
    completed: false,
    createdAt: new Date().toISOString()
  }
  await addTaskToStorage(task)
}

const deleteTask = async (id: string) => {
  await deleteTaskFromStorage(id)
}
```

**Lines saved:** ~40 → ~15 (62% reduction)

---

## Testing After Migration

For each migrated page, test:

```
☐ Page loads without errors
☐ Data displays correctly
☐ Can add new items
☐ Can edit items
☐ Can delete items
☐ Data persists after refresh
☐ Events still trigger (if applicable)
☐ Other components that listen still update
```

---

## Metadata Verification

After migration, check localStorage format:

```javascript
// Open browser console (F12)
const tasks = localStorage.getItem('tasks')
console.log(JSON.parse(tasks))

// Should see NEW format:
{
  data: [
    { id: '1', title: 'Task 1', ... }
  ],
  metadata: {
    version: 1,
    lastModified: "2026-01-21T10:30:00.000Z",
    source: "local"
  }
}

// If you see OLD format (no metadata):
[
  { id: '1', title: 'Task 1', ... }
]
// This will auto-migrate on first load!
```

---

## Future: Supabase Migration

When ready to switch to Supabase:

1. **Implement SupabaseAdapter methods** in `lib/storage/SupabaseAdapter.ts`
2. **Change ONE line** in `lib/storage/index.ts`:
   ```typescript
   // From:
   export const storage: StorageAdapter = new LocalStorageAdapter()
   
   // To:
   export const storage: StorageAdapter = new SupabaseAdapter()
   ```
3. **Done!** All pages automatically use Supabase.

---

## Current Status

✅ **Phase 2.1:** Storage abstraction complete  
✅ **Phase 2.2:** All data hooks created  
⏳ **Phase 2.3:** Migration pattern established, pages ready to migrate

**Next Action:** Apply migration pattern to all pages listed above.

---

## Estimated Time

- **Per page migration:** 15-30 minutes
- **Total pages:** ~10 pages
- **Total time:** 3-5 hours

**Benefits:**
- Cleaner code
- Better error handling
- Automatic loading states
- Future-proof for Supabase
- Centralized data logic
