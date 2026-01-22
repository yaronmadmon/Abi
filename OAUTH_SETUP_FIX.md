# OAuth Setup Fix - Google/Apple Sign-In

## Problem
Getting `400 Bad Request` error when trying to sign in with Google or Apple OAuth.

## Solution

### Step 1: Configure Redirect URLs in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
5. Click **Save**

### Step 2: Enable Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable**
4. You'll need to:
   - Create a Google OAuth app at https://console.cloud.google.com
   - Get your **Client ID** and **Client Secret**
   - Add them to Supabase
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Step 3: Enable Apple OAuth Provider (Optional)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Apple** in the list
3. Click **Enable**
4. Configure Apple OAuth credentials (requires Apple Developer account)

### Step 4: Verify Site URL

1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

## Quick Checklist

- [ ] Redirect URL `http://localhost:3000/auth/callback` added in Supabase
- [ ] Google OAuth provider enabled in Supabase
- [ ] Google OAuth credentials configured (Client ID & Secret)
- [ ] Site URL set correctly in Supabase
- [ ] Environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing

After configuration:
1. Restart your dev server: `npm run dev`
2. Try signing in with Google
3. You should be redirected to Google's sign-in page
4. After signing in, you'll be redirected back to `/auth/callback`
5. Then redirected to `/today` (main app)

## Common Issues

### "400 Bad Request"
- **Cause**: Redirect URL not configured in Supabase
- **Fix**: Add the redirect URL in Supabase Dashboard → Authentication → URL Configuration

### "Provider not enabled"
- **Cause**: Google/Apple OAuth provider not enabled
- **Fix**: Enable the provider in Supabase Dashboard → Authentication → Providers

### "Invalid client credentials"
- **Cause**: Google OAuth Client ID/Secret incorrect
- **Fix**: Verify credentials in Supabase Dashboard → Authentication → Providers → Google

### Redirect loop
- **Cause**: Site URL mismatch
- **Fix**: Ensure Site URL in Supabase matches your app URL

## Need Help?

If you're still having issues:
1. Check browser console for detailed error messages
2. Check Supabase Dashboard → Authentication → Logs for auth errors
3. Verify all environment variables are set correctly
4. Ensure you're using the correct Supabase project URL
