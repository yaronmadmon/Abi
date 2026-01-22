# Fix OpenAI Authentication (401 Error)

## Problem
Your current `OPENAI_API_KEY` in `.env.local` is **invalid** (OpenAI returns 401).

## Solution

### Step 1: Get a NEW API Key
1. Go to: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. **Copy the entire key** (starts with `sk-`)
   - ⚠️ Copy it NOW — you won't see it again!

### Step 2: Update `.env.local`
1. Open `C:\Abby\.env.local` in VS Code
2. Find the line: `OPENAI_API_KEY=sk-...`
3. Replace the ENTIRE value with your NEW key:
   ```env
   OPENAI_API_KEY=sk-your-new-key-here
   ```
4. Make sure there are NO:
   - Extra spaces around `=`
   - Quotes around the key
   - Duplicate `OPENAI_API_KEY` lines

### Step 3: Restart Dev Server
```powershell
# Stop current server (Ctrl+C → Y)
npm run dev
```

### Step 4: Test
1. Open http://localhost:3000/kitchen
2. Try the Assistant chat
3. You should see NO MORE:
   - "401 Incorrect API key"
   - "OpenAI TTS failed"
   - Voice errors in console

## Verification
After restart, test:
```bash
node -e "fetch('http://localhost:3000/api/ai/classify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'hello'})}).then(async r=>{const j=await r.json(); console.log('status',r.status); console.log('success',!j.intent?.followUpQuestion?.includes('401'));});"
```

Expected output:
```
status 200
success true
```

## Troubleshooting

### Still getting 401?
- Make sure you copied the NEW key (not the old one)
- Check `.env.local` has only ONE `OPENAI_API_KEY` line
- Delete `.next` folder: `rm -rf .next`
- Restart: `npm run dev`

### Key looks correct but still fails?
- Verify the key is active in OpenAI dashboard
- Make sure your OpenAI account has credits
- Check the key has permissions for Chat & TTS APIs

### Voice still not working?
- Hard refresh browser: **Ctrl+Shift+R**
- Check console for new errors
- Voice will fail silently if key is invalid (no more spam)
