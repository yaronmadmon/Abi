# UX v1.0 - FROZEN

**Date:** Final polish completed  
**Status:** FROZEN - No further UX restructuring without new version

---

## Navigation Structure

### Primary Tabs (Bottom Navigation)
1. **Today** (`/today`) - Landing page
2. **Home** (`/home`) - Tasks, Smart Home, Calendar
3. **Kitchen** (`/kitchen`) - Recipes, Groceries, Pantry
4. **Finance** (`/finance`) - Bills, Budget, Subscriptions
5. **People** (`/people`) - Family, Pets, Applicants
6. **Office** (`/office`) - Documents, Scanner, Fax, Archive

**Navigation Type:** Fixed bottom navigation bar  
**Active State:** Blue color, slight scale-up, semibold font  
**Safe Area:** Respects `env(safe-area-inset-bottom)` on iOS

---

## Today Page Structure (Landing)

**Route:** `/today`  
**Purpose:** Calm, scannable overview of what matters now

### Section Order (Top to Bottom):
1. **AI Focus Header** - 1-2 line contextual insight
2. **Now Card** - Next appointment + up to 3 urgent tasks
3. **Quick Capture Row** - 5 quick action buttons (Thought, Task, Reminder, Appointment, Note)
4. **Plan Something Card** - Opens bottom sheet for planning flows
5. **Care / Reset Card** - Optional self-care moment with 2-minute reset
6. **Glance Bar** - Collapsible weather + tomorrow peek

**Design Principle:** Show essentials first, hide advanced items. No endless scrolling.

---

## Bottom Sheets

### Quick Capture Sheet
- **Trigger:** Any quick capture button
- **Behavior:** Body scroll locked, smooth slide-up animation
- **Content:** AI input bar for natural language capture
- **Animation:** 240ms cubic-bezier spring (0.16, 1, 0.3, 1)

### Plan Something Sheet
- **Trigger:** "Plan Something" card
- **Behavior:** Body scroll locked, smooth slide-up animation
- **Content:** 5 planning options (Trip, Budget, Event, Wish list, Home project)
- **Animation:** 240ms cubic-bezier spring (0.16, 1, 0.3, 1)

---

## Design Principles

1. **Calm & Supportive** - Language is human, non-pushy, optional
2. **Progressive Disclosure** - Essentials first, details behind "See all"
3. **Card-Based Summaries** - One card = one topic + 1-2 primary actions
4. **Smooth Motion** - 200ms fade-in, 240ms spring slide-up, no jarring transitions
5. **Visual Consistency** - Rounded corners (2xl), soft shadows, glassmorphism
6. **Mobile-First** - Phone-first layout, safe-area aware

---

## Animation Standards

- **Fade-in:** 200ms ease-in-out
- **Slide-up:** 240ms cubic-bezier(0.16, 1, 0.3, 1) - spring-like, gentle
- **Scale interactions:** active:scale-95 (5% reduction)
- **Transitions:** 200ms duration for hover states

---

## Visual Tokens

- **Card Radius:** `rounded-2xl` (1.5rem)
- **Shadow:** `shadow-soft` (0 2px 20px rgba(0, 0, 0, 0.08))
- **Section Spacing:** `mb-4` (1rem) between cards
- **Card Padding:** `p-5` (1.25rem) for primary cards, `p-4` for compact
- **Bottom Nav Height:** 64px (4rem) + safe-area-inset-bottom

---

## Micro-Copy Tone

- **Human, not robotic** - "Take a moment" not "Care / Reset"
- **Supportive, not pushy** - "You're all set" not "Complete your tasks"
- **Short & clear** - 1-2 lines max per surface
- **Optional language** - "Take 2 minutes" not "You should reset"

---

## Section Page Pattern

All section pages follow this structure:
1. **Header** - Title + subtitle
2. **Summary Cards** (2-4 cards) - Scannable overview with "See all" links
3. **AI Input Bar** - Natural language capture
4. **Full Lists** - Complete data below summaries

---

## Explicit Freeze Notice

**⚠️ NO FURTHER UX RESTRUCTURING WITHOUT NEW VERSION**

This UX structure is frozen. Changes to:
- Navigation structure
- Today page section order
- Bottom sheet behavior
- Primary tab structure

...require a new version designation (v1.1, v2.0, etc.) and explicit approval.

**Allowed:** Bug fixes, content updates, performance improvements  
**Not Allowed:** Structural changes, new primary tabs, navigation redesign

---

## Version History

- **v1.0** - Initial UX refactor + final polish (FROZEN)
