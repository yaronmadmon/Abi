# 🚀 Quick Deploy to Vercel

## Current Status
✅ **READY TO DEPLOY**

- Login page hidden (`SHOW_LOGIN_PAGE = false`)
- Google OAuth disabled (`ENABLE_GOOGLE_AUTH = false`)
- App accessible (auth bypassed when login hidden)
- All error handling in place
- Build configuration verified

---

## Quick Deploy Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment - Login hidden, OAuth disabled"
git push
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Select your repository
5. **Add Environment Variables** (see below)
6. Click "Deploy"

**Option B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Add Environment Variables in Vercel

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGc...`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...`
- `OPENAI_API_KEY` = `sk-...`

**Optional:**
- `OPENWEATHER_API_KEY` = `...`
- `ELEVENLABS_API_KEY` = `...`

**Where to add:** Vercel Dashboard → Your Project → Settings → Environment Variables

### 4. After First Deploy

1. **Get your Vercel URL:** `https://your-app.vercel.app`
2. **Update Supabase Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set **Site URL**: `https://your-app.vercel.app`
   - Add **Redirect URL**: `https://your-app.vercel.app/auth/callback`
   - Click **Save**

### 5. Test Deployment

- Visit your Vercel URL
- Should load directly into the app (login hidden)
- Test core features (tasks, notes, etc.)
- Verify data persists after refresh

---

## What's Hidden/Disabled

- ✅ Login page UI hidden (but app accessible)
- ✅ Google OAuth disabled
- ✅ All auth logic preserved (can re-enable easily)

---

## Re-Enable Login (When Ready)

1. Set `SHOW_LOGIN_PAGE = true` in:
   - `middleware.ts`
   - `app/page.tsx`
   - `app/auth/signin/page.tsx`
   - `app/auth/signup/page.tsx`

2. Commit and push:
   ```bash
   git add .
   git commit -m "Re-enable login page"
   git push
   ```

3. Vercel will auto-deploy

---

## Troubleshooting

**Build fails?**
- Check all environment variables are set
- Run `npm run build` locally first

**App doesn't load?**
- Check Vercel logs
- Verify environment variables
- Check Supabase is configured

**Can't access app?**
- Login is hidden but app should be accessible
- Try visiting `/today` directly

---

**Status: READY TO DEPLOY** ✅
