# Domain System Implementation - Scope

## Implementation Required

This task requires creating a comprehensive domain system that conflicts with the frozen UX structure (UX_V1_FREEZE.md).

**Current Structure (Frozen UX):**
- Routes: `/today`, `/home`, `/kitchen`, `/finance`, `/people`, `/office`
- Bottom nav: Today, Home, Kitchen, Finance, People, Office

**Requested Domain System:**
- Dashboard routes: `/dashboard/home`, `/dashboard/office`, `/dashboard/kitchen`, etc.
- 7 domains with multiple subpages each
- Domain navigation menu
- Domain handlers

**This is a major restructuring that would replace the frozen UX.**

## Files to Create

### Domain Structure
- ✅ `domains/types.ts` - Done
- ✅ `domains/registry.ts` - Done
- Domain schema files (not needed - using unified DomainItem type)

### Domain Pages (30+ files)
- `/app/dashboard/home/` - 2 subpages
- `/app/dashboard/office/` - 4 subpages
- `/app/dashboard/kitchen/` - 5 subpages (move existing meals, shopping)
- `/app/dashboard/cleaning/` - 4 subpages
- `/app/dashboard/family/` - 4 subpages
- `/app/dashboard/kids/` - 3 subpages
- `/app/dashboard/car/` - 2 subpages

### Domain Handlers (6 files)
- `ai/handlers/officeHandler.ts`
- `ai/handlers/kitchenHandler.ts`
- `ai/handlers/cleaningHandler.ts`
- `ai/handlers/familyHandler.ts`
- `ai/handlers/kidsHandler.ts`
- `ai/handlers/carHandler.ts`

### Navigation
- Dashboard layout with domain menu
- Update global navigation

### Migration
- Move `/app/dashboard/tasks/` → `/app/dashboard/home/tasks/`
- Move `/app/dashboard/meals/` → `/app/dashboard/kitchen/meals/`
- Move `/app/dashboard/shopping/` → `/app/dashboard/kitchen/shopping/`
- Move `/app/dashboard/weekly/` → `/app/dashboard/home/weekly/`

## Status

**This implementation is very large and conflicts with frozen UX.**

**Recommendation:** Please confirm if you want to proceed with this implementation, which would replace the frozen UX structure.
