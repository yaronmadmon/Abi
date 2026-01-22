# Kitchen Duplicate Keys & Missing Images Fix - January 20, 2026

## Issues Fixed

### 1. ❌ React Duplicate Key Warning
**Error**: `Warning: Encountered two children with the same key, 'dinner-007'`

**Root Cause**: 
- The meal planner was reusing recipe IDs directly as meal plan IDs
- When you ran the planner multiple times, the same recipe could be selected again
- This created multiple meals in `weeklyMeals` with identical IDs like "dinner-007"
- React requires unique keys for list items

**Location**: `app/kitchen/planner/page.tsx:108`

### 2. ❌ Missing Images in Meal Cards
**Issue**: Meal cards showed no images

**Root Causes**:
1. Old meals in localStorage didn't have `imageUrl` fields
2. Some image URLs failed to load (network/CORS issues)
3. Conditional rendering hid images when `imageUrl` was missing

---

## What Was Fixed

### 1. Generate Unique Meal Plan IDs

**File**: `app/kitchen/planner/page.tsx`

**Before (Line 108)**:
```typescript
id: recipe.id,  // ❌ Reuses recipe ID directly
```

**After**:
```typescript
id: `meal-${recipe.id}-${date}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
recipeId: recipe.id,  // ✅ Keep original recipe ID for reference
```

**Result**: Each meal plan entry now gets a globally unique ID like:
- `meal-dinner-007-2026-01-20-1737408123456-x7k2p9m4a`
- `meal-dinner-007-2026-01-21-1737408123789-j3n8q5r2b`

Even if the same recipe is used twice, each meal plan entry has its own unique ID.

### 2. Updated TypeScript Interface

**File**: `app/kitchen/planner/page.tsx` (lines 12-25)

Added `recipeId` field to track the original recipe:
```typescript
interface GeneratedMeal {
  id: string              // Unique meal plan ID
  recipeId?: string       // Original recipe ID for reference
  date: string
  mealType: MealType
  // ...
}
```

### 3. Added Image Fallbacks

**Files Updated**:
- `app/kitchen/page.tsx` (Today's Meal section)
- `app/kitchen/day/[date]/page.tsx` (Meal Day View)
- `app/kitchen/planner/page.tsx` (Meal Planner Preview & Results)

**Changes**:
1. **Removed conditional rendering** - Images now always render
2. **Added fallback URL** - If `imageUrl` is missing, uses placeholder
3. **Added error handler** - If image fails to load, shows placeholder

**Before**:
```typescript
{meal.imageUrl && (
  <img src={meal.imageUrl} alt={meal.title} />
)}
```

**After**:
```typescript
<img 
  src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
  alt={meal.title}
  onError={(e) => {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
  }}
/>
```

**Fallback Image**: Generic food/salad photo from Unsplash

---

## Testing

### ✅ Test Duplicate Keys Fix
1. Go to Kitchen → "What's for Dinner?" (Meal Planner)
2. Generate a meal plan
3. Go back and generate another meal plan
4. Open browser console → **No more duplicate key warnings!**

### ✅ Test Image Display
1. Check Kitchen page → Today's Meal section
2. All meals should show images (either recipe image or placeholder)
3. If a recipe image fails, fallback placeholder appears automatically
4. No blank spaces where images should be

### ✅ Test Old Data
1. Meals saved before this fix should still work
2. They'll show the fallback placeholder image
3. Newly generated meals will have proper recipe images

---

## Technical Details

### Why This Approach?

**Unique ID Generation**:
- `meal-${recipe.id}` - Links back to recipe
- `${date}` - Distinguishes same recipe on different days  
- `${Date.now()}` - Timestamp for uniqueness
- `${Math.random()}` - Extra randomness if planner runs multiple times in same millisecond

**Image Fallback Strategy**:
1. Try to load `meal.imageUrl` (from recipe database)
2. If missing, use placeholder URL
3. If loading fails (404/CORS), `onError` loads placeholder
4. Result: Images always display, never blank

---

## Status

✅ **Duplicate key warning fixed** - Each meal plan entry has unique ID  
✅ **Images display correctly** - All meals show images or fallback  
✅ **Backward compatible** - Old meals in localStorage still work  
✅ **No breaking changes** - All existing functionality preserved  

---

**Fixed**: January 20, 2026  
**Files Modified**: 3 files  
**Status**: Complete and tested
