# Fix 404 Static Assets - Next.js Build Reset

## Problem

The browser shows `404 Not Found` errors for Next.js static assets:
- `_next/static/css/app/layout.css`
- `_next/static/chunks/main-app.js`
- `_next/static/chunks/app-pages-internals.js`
- `_next/static/chunks/app/layout.js`

## Root Cause

This happens when:
1. The browser cached references to old/stale build assets
2. Multiple dev server instances were started/stopped
3. The `.next` build cache is corrupted or outdated
4. The browser is accessing the wrong port (3000 vs 3001)

## Solution

### Option 1: Run Reset Script (Recommended)

```powershell
.\reset-dev.bat
```

This script will:
1. Stop all Node.js processes
2. Delete `.next` build cache
3. Clean npm cache
4. Start fresh dev server on port 3000

### Option 2: Manual Steps

1. **Stop all dev servers**:
   - Press `Ctrl+C` in all terminal windows running `npm run dev`
   - Or run: `taskkill /F /IM node.exe`

2. **Delete build cache**:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. **Hard refresh browser**:
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Press `Cmd+Shift+R` (Mac)

4. **Start dev server**:
   ```powershell
   npm run dev
   ```

5. **Access correct URL**:
   - Go to `http://localhost:3000` (not 3001)
   - Make sure the terminal shows "Local: http://localhost:3000"

## Verification

After restarting, you should see:
- ✅ No 404 errors in browser console
- ✅ Page loads with full styling
- ✅ Tailwind classes apply correctly
- ✅ Navigation works without errors

## Important Notes

- **Always use the same port**: If the dev server starts on 3001, it means port 3000 is in use. Stop all Node processes first.
- **Hard refresh after restart**: Browser cache can hold old asset references. Always hard refresh.
- **Check terminal output**: The terminal should show "Ready in X ms" without errors.
- **Webpack cache disabled**: `next.config.js` already disables persistent cache in dev mode to prevent this issue.

## If Problem Persists

1. **Clear browser cache entirely**:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files

2. **Check for running processes**:
   ```powershell
   Get-Process node -ErrorAction SilentlyContinue
   ```

3. **Verify Next.js config**:
   - Ensure `next.config.js` has `webpack: (config, { dev }) => { if (dev) { config.cache = false } return config }`

4. **Check for conflicting files**:
   - Ensure no `pages/` directory exists (we use App Router only)
   - Ensure `app/layout.tsx` exists and imports `./globals.css`

## Prevention

- Use `reset-dev.bat` whenever you see 404 errors
- Always hard refresh after code changes
- Stop old dev servers before starting new ones
- Run `npm run dev` from the project root only
