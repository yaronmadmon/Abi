# Architecture Note

## Active System (Current)

This project uses **Next.js 14+ with App Router** as the active architecture.

### Active Directories:

- **`app/`** - Next.js App Router pages and API routes
  - Main pages: `/today`, `/home`, `/kitchen`, `/finance`, `/people`, `/office`
  - API routes: `/api/ai/classify`
  - Layout and global styles

- **`ai/`** - AI Foundation (Active)
  - `aiInterpreter.ts` - Rule-based intent interpretation
  - `aiRouter.ts` - Intent routing to modules
  - `aiClarifier.ts` - Follow-up question generation
  - `aiUtils.ts` - Utility functions
  - `schemas/` - Type definitions (intentSchema, routerSchema)
  - `patterns/` - Pattern matching (cleaning, cooking, shopping, time, general)
  - `handlers/` - Module adapters (tasks, meals, shopping, reminders)

- **`components/`** - React components
  - Navigation, sheets, today components, section components

- **`types/`** - TypeScript type definitions
  - `home.ts` - Core data models (Task, Meal, ShoppingItem, HomeProfile)

- **`public/`** - Static assets (if any)

### Build System:
- **Next.js** (`next dev`, `next build`)
- **TypeScript** (tsconfig.json)
- **Tailwind CSS** (tailwind.config.ts)
- **PostCSS** (postcss.config.js)

---

## Archived System (Not Used)

### Archived Directory:

- **`old_src/`** - Legacy Vite/React project (ARCHIVED, NOT USED)

This directory contains the previous application architecture:
- Vite build system
- React Router (not Next.js Router)
- Old AI concepts (MoodClassifier, BehaviorPolicy, EmotionalContext, etc.)
- Legacy pages and components
- Old routing structure

**Status:** Archived for reference only. Not imported or used by the active Next.js app.

**Note:** The `vite.config.ts` file in the root references `./src` but is not used by Next.js. It remains for historical reference.

---

## Development

### Running the App:
```bash
npm run dev    # Start Next.js dev server
npm run build  # Build for production
npm run start  # Start production server
```

### Entry Point:
- App starts at `/` and redirects to `/today` (landing page)
- Onboarding flow at `/onboarding` (first-time users)

---

## Important Notes

1. **Do not import from `old_src/`** - It is archived legacy code
2. **Active AI system is in `ai/`** - Not the old `old_src/ai/`
3. **Active pages are in `app/`** - Not the old `old_src/pages/`
4. **TypeScript paths** - `@/*` maps to root directory (not `src/`)

---

## Migration History

- **Previous:** Vite + React Router + legacy AI system
- **Current:** Next.js App Router + new AI foundation
- **Date:** Architecture cleanup completed
