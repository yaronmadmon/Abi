# Zod Usage Policy - Runtime Validation

**Status:** ACTIVE - Enforced from January 21, 2026  
**Purpose:** Prevent validation overhead and maintain performance

---

## The Rule (Non-Negotiable)

**Zod validation ONLY runs at system boundaries. NEVER in render paths.**

System boundaries:
- ✅ Data loading from storage
- ✅ Data saving to storage
- ✅ API responses (from backend)
- ✅ AI handler responses
- ✅ User form submissions (on submit, not onChange)

Not allowed:
- ❌ Inside render functions
- ❌ During component state updates
- ❌ On every keystroke (onChange)
- ❌ In useMemo/useCallback dependencies

---

## Why This Matters

Zod validation is synchronous and can be expensive:
- Parsing JSON structures
- Checking types recursively
- Generating error messages
- Running regex patterns

**Running validation in render paths causes:**
- Sluggish UI (validation on every render)
- Dropped keystrokes (validation on every onChange)
- Unnecessary CPU usage
- Battery drain on mobile

**The 1% rule:** Validate once when data enters the system (1% of operations), not on every use (99% of operations).

---

## Correct Usage

### ✅ At Load Time (Storage Boundary)
```typescript
// lib/storage/LocalStorageAdapter.ts
async get<T>(key: string): Promise<StorageItem<T> | null> {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  
  const parsed = JSON.parse(raw)
  
  // ✅ GOOD - Validate once when loading from storage
  if (parsed.data) {
    const schema = getSchemaForKey(key)
    const result = schema.safeParse(parsed.data)
    if (!result.success) {
      logger.warn('Invalid data format', { key, errors: result.error })
      return null // Don't load corrupt data
    }
  }
  
  return parsed
}
```

### ✅ At Save Time (Storage Boundary)
```typescript
// hooks/data/useTasksData.ts
const addTask = useCallback(async (task: Task) => {
  // ✅ GOOD - Validate before saving to storage
  const validation = validateTask(task)
  if (!validation.success) {
    logger.error('Invalid task data', validation.error)
    return false
  }
  
  return await saveTasks([...tasks, task])
}, [tasks, saveTasks])
```

### ✅ At API Boundary
```typescript
// app/api/ai/meals/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // ✅ GOOD - Validate API input
  const result = MealSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid meal data', details: result.error },
      { status: 400 }
    )
  }
  
  // Process validated data
  return NextResponse.json({ success: true })
}
```

### ✅ At AI Handler Response
```typescript
// ai/handlers/tasksHandler.ts
async propose(payload: TaskPayload): Promise<TaskPreview> {
  // ✅ GOOD - Validate AI-generated data before creating preview
  const validation = validateTask(payload)
  if (!validation.valid) {
    throw new Error(`Invalid task: ${validation.errors.join(', ')}`)
  }
  
  return { preview, validation, impacts }
}
```

### ✅ At Form Submit (Not onChange)
```typescript
// components/sheets/TaskCreateSheet.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  
  // ✅ GOOD - Validate once on submit
  const result = TaskSchema.safeParse({
    id: generateId(),
    title: titleInput,
    completed: false,
    createdAt: new Date().toISOString()
  })
  
  if (!result.success) {
    setError(result.error.format())
    return
  }
  
  await onSave(result.data)
}
```

---

## Incorrect Usage (Anti-Patterns)

### ❌ In Render Path
```typescript
// ❌ BAD - Validates on every render
export default function TaskList() {
  const { tasks } = useTasksData()
  
  // ❌ BAD - This runs on EVERY render
  const validTasks = tasks.filter(task => isValidTask(task))
  
  return (
    <div>
      {validTasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}

// ✅ GOOD - Validate once when loading, trust data in render
export default function TaskList() {
  const { tasks } = useTasksData() // Already validated at load
  
  return (
    <div>
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}
```

### ❌ On onChange
```typescript
// ❌ BAD - Validates on every keystroke
<input
  value={title}
  onChange={(e) => {
    const result = z.string().min(1).max(200).safeParse(e.target.value)
    if (result.success) {
      setTitle(e.target.value)
    }
  }}
/>

// ✅ GOOD - Validate on submit, allow typing freely
<input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
// Validate in handleSubmit()
```

### ❌ In useMemo/useCallback
```typescript
// ❌ BAD - Validates on every dependency change
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    const valid = TaskSchema.safeParse(task)
    return valid.success && !task.completed
  })
}, [tasks])

// ✅ GOOD - Trust data is already valid
const filteredTasks = useMemo(() => {
  return tasks.filter(task => !task.completed)
}, [tasks])
```

### ❌ Deep Validation
```typescript
// ❌ BAD - Validating nested structure repeatedly
const renderTask = (task: Task) => {
  // ❌ BAD - Validate every time we render
  if (!isValidTask(task)) return null
  
  return <TaskCard task={task} />
}

// ✅ GOOD - Validate at boundary, trust in render
const renderTask = (task: Task) => {
  return <TaskCard task={task} />
}
```

---

## Where Validation Happens

### System Architecture:

```
┌─────────────────────────────────────────┐
│         User Input / AI Response        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  System Boundary (Validate Here)│   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Storage / Database              │
│      (Data is Valid from here on)       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       Application Logic & Render        │
│      (NO validation needed here)        │
│                                         │
│  ✅ Components trust data               │
│  ✅ Hooks trust data                    │
│  ✅ Utils trust data                    │
└─────────────────────────────────────────┘
```

**Key insight:** Validate once at entry, trust everywhere else.

---

## Validation Checklist

When adding validation, ask:

```
☐ Is this at a system boundary?
   ✅ Loading from storage → YES
   ✅ Saving to storage → YES
   ✅ API request/response → YES
   ✅ AI handler input/output → YES
   ❌ Component render → NO
   ❌ State update → NO
   ❌ Event handler → NO (unless submitting)

☐ Will this run frequently?
   ❌ Every render → Don't validate
   ❌ Every keystroke → Don't validate
   ❌ Every state change → Don't validate
   ✅ Once per load → OK to validate
   ✅ Once per save → OK to validate

☐ Is there a better place?
   ✅ Move to storage adapter → YES
   ✅ Move to data hook → YES
   ✅ Move to API route → YES
   ❌ Keep in component → NO
```

---

## Performance Impact

### Bad validation placement:
```typescript
// Validates 1000x per page load
function TaskList() {
  const { tasks } = useTasksData() // 100 tasks
  
  return tasks.map(task => {
    const valid = isValidTask(task) // Validates 100 times per render
    return valid ? <TaskCard task={task} /> : null // Re-renders 10x = 1000 validations
  })
}
```

### Good validation placement:
```typescript
// Validates 1x per page load
async function load() {
  const item = await storage.get('tasks') // Validates once here
  setTasks(item?.data || [])
}

function TaskList() {
  const { tasks } = useTasksData() // Already validated
  return tasks.map(task => <TaskCard task={task} />) // Just render
}
```

**Impact:** 1000x fewer validation calls = faster UI, better battery life.

---

## Exception Cases

### Q: What if I receive untrusted data from a prop?

**A:** That's a system boundary. Validate in the parent before passing the prop.

```typescript
// ✅ GOOD - Validate before passing down
function ParentComponent({ externalData }) {
  const validated = useMemo(() => {
    const result = TaskSchema.safeParse(externalData)
    return result.success ? result.data : null
  }, [externalData])
  
  if (!validated) return <ErrorMessage />
  
  return <ChildComponent task={validated} /> // Child trusts this
}
```

### Q: What about user input validation (forms)?

**A:** Validate on submit (system boundary), not on change.

- ❌ onChange={validate} → Too frequent
- ✅ onSubmit={validate} → System boundary

For UX, use HTML5 validation or simple checks (length, pattern) on onChange, not Zod.

---

## Schema Organization

Keep validation schemas close to boundaries:

```
schemas/          # Zod schemas
  task.schema.ts
  note.schema.ts
  ...

lib/storage/      # Uses schemas at storage boundary
  LocalStorageAdapter.ts

hooks/data/       # Uses schemas at save boundary
  useTasksData.ts

app/api/          # Uses schemas at API boundary
  route.ts
```

**Don't import schemas into:**
- Components (render path)
- UI utilities (render path)
- Formatting functions (render path)

---

## Monitoring

Add to your performance monitoring:

```typescript
// lib/logger.ts
export function logValidation(key: string, duration: number) {
  if (duration > 10) { // 10ms threshold
    logger.warn('Slow validation detected', { key, duration })
  }
}

// Usage in storage adapter
const start = performance.now()
const result = schema.safeParse(data)
logValidation(key, performance.now() - start)
```

Watch for validation calls taking > 10ms. If found, investigate:
- Schema too complex?
- Data too large?
- Validation in wrong place?

---

## Summary

**DO validate:**
- ✅ At system entry points (load, API, AI)
- ✅ Before saving data
- ✅ On form submit

**DON'T validate:**
- ❌ In render functions
- ❌ On every state change
- ❌ On every user input (onChange)
- ❌ Inside useMemo/useCallback (unless at boundary)

**Remember:** Validate once (1%), trust everywhere else (99%).

---

## Status

**Policy Status:** ACTIVE and ENFORCED  
**Review:** Quarterly  
**Enforcement:** Code review + ESLint rules (future)

**This policy prevents "Zod fatigue" and maintains app performance.**
