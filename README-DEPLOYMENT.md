# 🚀 Production Deployment - Quick Start

## ✅ What's Been Set Up

1. **Database Schema** - Complete Supabase schema with RLS policies
2. **Authentication** - Supabase Auth with email/password and Google OAuth
3. **API Routes** - All existing API routes are production-ready
4. **Middleware** - Route protection and auth state management
5. **Client/Server Separation** - Proper Supabase client setup

## 📋 Deployment Checklist

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Wait for database to initialize

### 2. Run Database Schema
- In Supabase Dashboard → SQL Editor
- Copy and paste contents of `supabase/schema.sql`
- Click "Run"

### 3. Get Supabase Credentials
- Settings → API
- Copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Supabase Auth
- Authentication → URL Configuration
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: Add `https://your-app.vercel.app/auth/callback`

### 5. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
```

### 6. Environment Variables in Vercel Dashboard
Go to Project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

### 7. Generate NEXTAUTH_SECRET (if using NextAuth)
```bash
openssl rand -base64 32
```

## 🔧 Post-Deployment

1. **Test Sign Up** - Create a new account
2. **Test Data Persistence** - Add a task, refresh, verify it's still there
3. **Test Multi-User** - Create second account, verify data isolation
4. **Test Logout/Login** - Verify session persistence

## ⚠️ Important Notes

- **localStorage Migration**: The app currently uses localStorage. You'll need to migrate data access to use Supabase. This is a large refactor that should be done incrementally.
- **API Routes**: All `/api/ai/*` routes work as-is in production
- **Authentication**: Supabase handles all auth, no additional setup needed
- **Database**: All tables have RLS enabled - users can only see their own data

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
→ Check all env vars are set in Vercel

**"Failed to sign in"**
→ Verify redirect URLs in Supabase match your Vercel URL

**"Database connection error"**
→ Check Supabase URL and keys are correct

**"RLS policy violation"**
→ Verify user is authenticated and policies are set correctly
