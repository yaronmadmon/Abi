# Vercel Auto-Deployment Troubleshooting

## Issue: Automatic deployments not triggering

### Quick Fix Steps:

1. **Verify Vercel Project Connection**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Git**
   - Confirm repository: `yaronmadmon/Abi`
   - Confirm branch: `main`

2. **Check Production Branch**
   - Settings → Git → Production Branch
   - Should be set to: `main`

3. **Verify Webhook is Active**
   - Settings → Git → Connected Git Repository
   - Check if webhook shows as "Active"
   - If not, click "Reconnect" or "Configure"

4. **Enable Automatic Deployments**
   - Settings → Git → Deploy Hooks
   - Ensure "Automatic deployments from Git" is **enabled**

5. **Manual Trigger (if needed)**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or create a new deployment manually

## If Still Not Working:

### Option 1: Reconnect Repository
1. Settings → Git → Disconnect
2. Reconnect the repository
3. This will recreate the webhook

### Option 2: Check GitHub Webhooks
1. Go to GitHub: https://github.com/yaronmadmon/Abi/settings/hooks
2. Look for Vercel webhook
3. Check if it's active and receiving events
4. If missing, reconnect in Vercel

### Option 3: Manual Deployment
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click "Create Deployment"
4. Select branch: `main`
5. Click "Deploy"

## Current Status:
- ✅ Latest commit pushed: `a0a0c60` - "Trigger Vercel auto-deployment"
- ✅ Repository: `yaronmadmon/Abi`
- ✅ Branch: `main`
- ✅ Vercel config: `vercel.json` exists

## Next Steps:
1. Check Vercel dashboard for new deployment
2. If no deployment appears, follow troubleshooting steps above
3. If webhook is missing, reconnect the repository in Vercel
