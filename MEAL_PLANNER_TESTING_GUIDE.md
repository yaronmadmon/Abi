# 🧪 Meal Planner Testing Guide

## Quick Start Test (5 minutes)

### Test 1: Generate a Full Week with All Meal Types

1. **Open Meal Planner**
   - Navigate to `http://localhost:3000/kitchen`
   - Click **"What's for Dinner?"** or **"Meal Planner"**

2. **Choose Planning Mode**
   - Click **"Browse Curated Recipes"** (orange card, recommended)

3. **Select ALL Meal Types**
   - Click **Breakfast** 🍳
   - Click **Lunch** 🥪  
   - Click **Dinner** 🍽️
   - All three should have orange background + checkmark

4. **Select Time Range**
   - Click **"This Week"**
   - Click **"Next"**

5. **Create Plan**
   - Click **"Create Plan"**
   - Wait for generation (instant for curated)

6. **✨ NEW: Shopping List Confirmation**
   - You should see: **"Add ingredients to shopping list?"**
   - Shows: "X unique ingredients"
   - **For this test, click "Yes, Add All"**

7. **View Results**
   - You should see a **green success banner**: "Plan Created!"
   - Shows "21 meals added" (7 days × 3 meal types)
   
8. **Verify All Meal Types**
   - Expand any day (click on a day card)
   - **VERIFY YOU SEE**:
     - 🍳 **Breakfast** (top)
     - 🥪 **Lunch** (middle)
     - 🍽️ **Dinner** (bottom)
   - No duplicates, no missing meals

9. **View Full Recipe**
   - Click **"▶ Show full recipe"** on any meal
   - **VERIFY YOU SEE**:
     - ✅ Meal image
     - ✅ Meal name + description
     - ✅ **Ingredients:** (list with quantities)
     - ✅ **Instructions:** (numbered steps)
   - Click **"▼ Hide recipe"** to collapse

10. **Check Shopping List**
    - Navigate to `/dashboard/shopping`
    - **VERIFY**: Ingredients were added under "Meal Plan Ingredients"

---

### Test 2: Decline Shopping List

1. Go back to Meal Planner
2. Click **"Create Another Plan"**
3. Select different meal types (e.g., just Dinner)
4. Select **"Just Today"**
5. Generate plan
6. **On confirmation screen, click "No Thanks"**
7. **VERIFY**:
   - Meals are saved (you see results)
   - Shopping list was NOT modified

---

### Test 3: AI Mode

1. Create another plan
2. Choose **"Generate with AI"** (blue card)
3. Select meal types
4. Generate
5. **VERIFY**:
   - AI generates meals (takes 3-5 seconds)
   - All selected meal types included
   - Instructions are present
   - Confirmation flow works same as curated

---

## Expected Results Summary

### ✅ What You Should See

**Confirmation Screen:**
```
┌─────────────────────────────────────┐
│ 🍳 Plan Ready!                      │
│ 21 meals planned                    │
├─────────────────────────────────────┤
│ 🛒 Add ingredients to shopping list?│
│                                     │
│ I can add all the ingredients you   │
│ need for these meals...             │
│                                     │
│ • 45 unique ingredients             │
│ • Organized by category             │
│ • Ready for your next grocery trip  │
│                                     │
│ [Yes, Add All] [No Thanks]          │
└─────────────────────────────────────┘
```

**Results Screen (Expanded Day):**
```
┌─────────────────────────────────────┐
│ Monday, Jan 20                      │
│ 3 meals planned                  ▼  │
├─────────────────────────────────────┤
│ [IMG] 🍳 BREAKFAST                  │
│       Fluffy Pancakes               │
│       Classic buttermilk pancakes   │
│       ⏱️ 30 min • 8 ingredients     │
│       ▶ Show full recipe            │
├─────────────────────────────────────┤
│ [IMG] 🥪 LUNCH                      │
│       Caesar Salad with Chicken     │
│       Classic Caesar with grilled..  │
│       ⏱️ 22 min • 6 ingredients     │
│       ▶ Show full recipe            │
├─────────────────────────────────────┤
│ [IMG] 🍽️ DINNER                     │
│       Classic Spaghetti Carbonara   │
│       Creamy Italian pasta with...   │
│       ⏱️ 30 min • 6 ingredients     │
│       ▶ Show full recipe            │
└─────────────────────────────────────┘
```

**Expanded Recipe:**
```
┌─────────────────────────────────────┐
│ [IMG] 🍽️ DINNER                     │
│       Classic Spaghetti Carbonara   │
│       Creamy Italian pasta with...   │
│       ⏱️ 30 min • 6 ingredients     │
│       ▼ Hide recipe                 │
│                                     │
│ Ingredients:                        │
│ • 1 lb spaghetti                    │
│ • 8 oz, diced pancetta              │
│ • 4 large eggs                      │
│ • 1 cup, grated parmesan cheese     │
│ • 1 tsp black pepper                │
│ • to taste salt                     │
│                                     │
│ Instructions:                       │
│ 1. Bring a large pot of salted...   │
│ 2. While pasta cooks, crisp...      │
│ 3. In a bowl, whisk together...     │
│ 4. Reserve 1 cup pasta water...     │
│ 5. Remove skillet from heat...      │
│ 6. Quickly stir in egg mixture...   │
│ 7. Serve immediately with...        │
└─────────────────────────────────────┘
```

---

## ❌ What You Should NOT See

- ❌ Only dinner meals (should have all types)
- ❌ Duplicate dinners instead of breakfast/lunch
- ❌ Missing ingredients or instructions
- ❌ Auto-added to shopping list without asking
- ❌ Meals not organized by type
- ❌ Empty recipe details

---

## 🐛 If Something Looks Wrong

### Issue: Only seeing dinner meals

**Check:**
- Did you select multiple meal types in Step 2?
- Look for the checkmarks on Breakfast, Lunch, Dinner cards

**Fix:**
- Go back and ensure all meal types are selected (orange with checkmark)

### Issue: No instructions showing

**Check:**
- Did you click "▶ Show full recipe"?
- Recipes are collapsed by default

**Fix:**
- Click the "Show full recipe" button to expand

### Issue: Confirmation didn't appear

**Check:**
- Wait for the generation to complete
- Should transition from "Creating your plan..." to confirmation

**Fix:**
- Try generating again
- Check browser console for errors

### Issue: Shopping list not updated

**Check:**
- Did you click "Yes, Add All" on confirmation?
- If you clicked "No Thanks", it won't add

**Fix:**
- This is correct behavior! Create another plan and choose "Yes"

---

## 📊 Success Checklist

After testing, you should have:

- ✅ Seen breakfast, lunch, and dinner in one plan
- ✅ Viewed full recipes with ingredients
- ✅ Seen step-by-step cooking instructions
- ✅ Been asked about shopping list (not auto-added)
- ✅ Confirmed ingredients can be added or skipped
- ✅ Verified meals are organized by day and type
- ✅ Confirmed recipes expand/collapse smoothly

---

## 🎯 Next Steps

Once you've verified everything works:

1. **Try different combinations**:
   - Just breakfast for the week
   - Lunch + Dinner for 3 days
   - All meals for just today

2. **Test AI mode**:
   - Compare curated vs AI generated recipes
   - Verify AI also includes instructions

3. **Use it for real**:
   - Plan your actual meals for the week
   - Add to shopping list
   - Check the Kitchen page to see meals appear

---

**Happy testing! The Meal Planner is now complete.** 🎉
