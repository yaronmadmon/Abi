# 🗄️ Supabase Setup - Quick Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "Sign in"
3. Click "New Project"
4. Fill in:
   - **Name**: `Abi` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (for now)
5. Click "Create new project"
6. ⏳ Wait 2-3 minutes for setup

## Step 2: Run Database Schema

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase/schema.sql` from your project
4. **Copy the ENTIRE file contents**
5. **Paste into SQL Editor**
6. Click **Run** (or press Ctrl+Enter)
7. ✅ Should see: "Success. No rows returned"

## Step 3: Get Your API Keys

1. Click **Settings** (gear icon, left sidebar)
2. Click **API**
3. Copy these values:

### Project URL
```
https://xxxxx.supabase.co
```
(Copy the entire URL)

### anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2...
```
(Copy the entire long string)

### service_role key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY...
```
(Copy the entire long string - **KEEP THIS SECRET!**)

## Step 4: Configure Auth URLs

1. Click **Authentication** (left sidebar)
2. Click **URL Configuration**
3. Set **Site URL**: `http://localhost:3001`
4. Under **Redirect URLs**, click **Add URL** and add:
   - `http://localhost:3001/auth/callback`
5. Click **Save**

## Step 5: Create .env.local File

1. In your project root (`C:\Abi`), create a file named `.env.local`
2. Copy the template from `.env.local.template`
3. Paste your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (your actual key)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your actual key)
   OPENAI_API_KEY=sk-... (your existing OpenAI key)
   ```
4. Save the file

## Step 6: Test Locally

1. Restart your dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Visit http://localhost:3001
3. Should redirect to `/auth/signin`
4. Try creating an account
5. Should redirect to `/today` after signup

## ✅ Success Indicators

- ✅ Can access signin page
- ✅ Can create account
- ✅ Can sign in
- ✅ Redirects to `/today` after login
- ✅ No errors in browser console

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
→ Check `.env.local` exists and has all 3 Supabase variables

**"Failed to sign up"**
→ Check Supabase project is active (not paused)
→ Check redirect URLs are set correctly

**"Database error"**
→ Make sure you ran the schema.sql file
→ Check SQL Editor for any error messages
