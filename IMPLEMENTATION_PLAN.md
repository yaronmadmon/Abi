# UX Refactor Implementation Plan

## File/Component Changes

### New Components to Create
1. `components/navigation/BottomNav.tsx` - Main tab navigation
2. `components/today/AIFocusHeader.tsx` - AI insight header
3. `components/today/NowCard.tsx` - Next appointment + urgent items
4. `components/today/QuickCaptureRow.tsx` - Quick action buttons
5. `components/today/CareCard.tsx` - Self-care card
6. `components/today/GlanceBar.tsx` - Collapsible weather + tomorrow peek
7. `components/sheets/QuickCaptureSheet.tsx` - Bottom sheet for quick capture
8. `components/sheets/PlanSomethingSheet.tsx` - Bottom sheet for planning
9. `components/section/SummaryCard.tsx` - Reusable summary card component

### Pages to Create/Refactor
1. `app/today/page.tsx` - New Today landing page
2. `app/home/page.tsx` - Home section (tasks + smart home)
3. `app/kitchen/page.tsx` - Kitchen section (recipes + groceries + pantry)
4. `app/finance/page.tsx` - Finance section (bills + budget + subscriptions)
5. `app/people/page.tsx` - People section (family + pets + applicants)
6. `app/office/page.tsx` - Office section (documents + scanner + fax)

### Navigation Updates
- Update `app/layout.tsx` to include BottomNav
- Update `app/page.tsx` to redirect to `/today`

### Feature Migration
- Tasks → Home section
- Meals → Kitchen section
- Shopping → Kitchen section
- Weekly view → Home section
- Existing dashboard features distributed appropriately
