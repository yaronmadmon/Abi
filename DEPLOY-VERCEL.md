# 🚀 Deploy to Vercel - Step by Step

## Prerequisites
- ✅ Code pushed to GitHub (done!)
- ✅ Supabase project created
- ✅ Environment variables ready

## Step 1: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click **Sign Up** (or **Log In** if you have an account)
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub

## Step 2: Import Your Project

1. Click **Add New Project** (or **Import Project**)
2. Find **`yaronmadmon/Abi`** in the list
3. Click **Import**

## Step 3: Configure Project

1. **Project Name**: `abi` (or leave default)
2. **Framework Preset**: Should auto-detect **Next.js** ✅
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)
6. **Install Command**: `npm install` (default)

**Don't click Deploy yet!** We need to add environment variables first.

## Step 4: Add Environment Variables

1. Scroll down to **Environment Variables** section
2. Click **Add** for each variable:

### Variable 1:
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xxxxx.supabase.co` (your Supabase URL)
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 2:
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGc...` (your anon key)
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 3:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGc...` (your service_role key)
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 4:
- **Key**: `OPENAI_API_KEY`
- **Value**: `sk-...` (your OpenAI key)
- **Environments**: ✅ Production ✅ Preview ✅ Development

## Step 5: Deploy

1. Click **Deploy** button
2. ⏳ Wait 2-3 minutes for build
3. ✅ You'll see: "Congratulations! Your project has been deployed"
4. Click **Visit** to see your live app!

## Step 6: Get Your Live URL

Your app will be at:
```
https://abi-xxxxx.vercel.app
```
or
```
https://abi.vercel.app
```
(if you set a custom domain)

**Copy this URL!** You'll need it for the next step.

## Step 7: Update Supabase Auth URLs

1. Go back to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. **Site URL**: Change to your Vercel URL
   ```
   https://abi-xxxxx.vercel.app
   ```
4. **Redirect URLs**: Add your callback URL
   ```
   https://abi-xxxxx.vercel.app/auth/callback
   ```
5. Click **Save**

## Step 8: Test Production

1. Visit your Vercel URL
2. Try signing up
3. Try signing in
4. Verify everything works!

## ✅ Success Checklist

- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Can access live URL
- [ ] Supabase auth URLs updated
- [ ] Can sign up on production
- [ ] Can sign in on production

## 🎉 You're Live!

Your app is now publicly accessible! Share the URL with friends.

## 🔄 Future Updates

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically:
- Detect the push
- Build your app
- Deploy the new version
- Update your live URL

No manual deployment needed! 🚀
