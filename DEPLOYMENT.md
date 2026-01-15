# Production Deployment Guide

## Prerequisites

1. **Supabase Account** - Sign up at https://supabase.com
2. **Vercel Account** - Sign up at https://vercel.com
3. **OpenAI API Key** - Get from https://platform.openai.com

## Step 1: Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Go to Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## Step 2: Configure Environment Variables

### In Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to "Site URL" and "Redirect URLs"

### In Vercel Dashboard:
1. Go to your project > Settings > Environment Variables
2. Add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)

## Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js
4. Add environment variables
5. Deploy

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Sign up for a new account
3. Create a task, family member, or pet
4. Refresh the page - data should persist
5. Log out and log back in - data should still be there

## Troubleshooting

- **Database connection errors**: Check Supabase URL and keys
- **Auth not working**: Verify redirect URLs in Supabase
- **API errors**: Check OpenAI API key is set
- **Build failures**: Check all environment variables are set
