# Architecture Guardrails Summary

**Date:** January 21, 2026  
**Purpose:** Prevent architecture erosion over time  
**Status:** ACTIVE and ENFORCED

---

## The Three Guardrails

### 1. Migration Policy - Prevents Pattern Bifurcation
**File:** [`MIGRATION_POLICY.md`](MIGRATION_POLICY.md)

**Rule:** Any file touched must use data hooks. No exceptions.

**Prevents:**
- Some pages using new pattern, others using old
- Codebase diverging instead of converging
- Migration becoming impossible

**Enforcement:**
- ✅ Code review: Check for `localStorage.getItem/setItem`
- ✅ Developer discipline: Migrate before adding features
- ⏳ Future: ESLint rule to warn on direct localStorage

**Migration time:** 15-30 min per file  
**Long-term benefit:** Technical debt decreases over time

---

### 2. Memoization Comments - Prevents Performance Entropy
**Files:** 5 components with `React.memo()`

**Rule:** Every memoized component must document WHY it's memoized.

**Format:**
```typescript
// Memoized because: <reason>
// Remove memo if: <condition>
const Component = memo(function Component() { ... })
```

**Prevents:**
- Future devs removing memoization accidentally
- Breaking performance assumptions when props change
- "Why is this memoized?" confusion

**Enforcement:**
- ✅ Comments added to all 5 memoized components
- ✅ Code review: New memo() requires comment
- ✅ Document performance assumption explicitly

**Examples added to:**
- `components/today/WeatherCard.tsx`
- `components/today/CalendarCard.tsx`
- `components/today/NowCard.tsx`
- `components/today/QuickCaptureRow.tsx`

---

### 3. Zod Usage Policy - Prevents Validation Overhead
**File:** [`ZOD_USAGE_POLICY.md`](ZOD_USAGE_POLICY.md)

**Rule:** Zod only at system boundaries (load, save, API). Never in render paths.

**System boundaries (OK):**
- ✅ Loading from storage
- ✅ Saving to storage
- ✅ API requests/responses
- ✅ AI handler inputs/outputs
- ✅ Form submit (not onChange)

**Not allowed:**
- ❌ Inside render functions
- ❌ On every state change
- ❌ On every keystroke (onChange)
- ❌ In useMemo/useCallback (unless boundary)

**Prevents:**
- Validation running 1000x instead of 1x
- Sluggish UI from repeated validation
- Battery drain from unnecessary CPU usage

**Key principle:** Validate once (1%), trust everywhere else (99%)

---

## Why These Guardrails Matter

### Without Guardrails:
- ❌ Patterns slowly diverge
- ❌ Performance quietly degrades
- ❌ Code becomes inconsistent
- ❌ Technical debt accumulates
- ❌ Future refactors become impossible

### With Guardrails:
- ✅ Patterns converge over time
- ✅ Performance assumptions documented
- ✅ Code stays consistent
- ✅ Technical debt decreases
- ✅ Architecture stays maintainable

---

## Enforcement

### During Development:
1. **Before touching a file:** Check for legacy pattern
2. **If found:** Migrate to data hooks first (15-30 min)
3. **When adding memo():** Document why with comment
4. **When adding Zod:** Verify it's at a system boundary

### During Code Review:
1. **Check for `localStorage` calls:** Request data hook migration
2. **Check for `memo()` without comment:** Request documentation
3. **Check for Zod in render paths:** Request move to boundary

### Future Automation:
```javascript
// Potential ESLint rules
{
  'no-restricted-globals': ['warn', {
    name: 'localStorage',
    message: 'Use data hooks instead'
  }],
  'no-restricted-imports': ['warn', {
    name: 'zod',
    importNames: ['z'],
    message: 'Only import Zod at system boundaries'
  }]
}
```

---

## Quick Reference

### Touching a file with localStorage?
→ Migrate to data hooks first (see [`MIGRATION_POLICY.md`](MIGRATION_POLICY.md))

### Adding React.memo()?
→ Add comment explaining why (see memoized components for examples)

### Adding Zod validation?
→ Verify it's at a system boundary (see [`ZOD_USAGE_POLICY.md`](ZOD_USAGE_POLICY.md))

---

## Review Schedule

**Quarterly reviews:**
- Q2 2026: Check % of files using data hooks (target: 50%)
- Q3 2026: Check % of files using data hooks (target: 75%)
- Q4 2026: Check % of files using data hooks (target: 100%)

**Metrics to track:**
- Number of files with legacy localStorage pattern
- Number of memoized components with documentation
- Performance regression from validation in render paths

---

## Impact Assessment

**Time cost:** ~30 minutes (documentation)  
**Maintenance cost:** ~2 minutes per code review  
**Long-term benefit:** Prevents months of refactoring work

**ROI:** Massive. These guardrails prevent architecture erosion that would otherwise require a major refactor in 6-12 months.

---

## Status

✅ **Guardrail 1:** Migration Policy - ACTIVE  
✅ **Guardrail 2:** Memoization Comments - ACTIVE  
✅ **Guardrail 3:** Zod Usage Policy - ACTIVE

**All three guardrails are now ENFORCED starting January 21, 2026.**

---

## Related Documentation

- [`ARCHITECTURE_UPGRADE_COMPLETE.md`](ARCHITECTURE_UPGRADE_COMPLETE.md) - Full upgrade summary
- [`PHASE_2_DATA_MIGRATION_PATTERN.md`](PHASE_2_DATA_MIGRATION_PATTERN.md) - How to migrate to hooks
- [`FINAL_VERIFICATION_CHECKLIST.md`](FINAL_VERIFICATION_CHECKLIST.md) - Testing guide

---

**These guardrails ensure your 10/10 architecture stays 10/10 as the codebase evolves.**
