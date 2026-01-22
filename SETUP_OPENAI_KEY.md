# Quick Fix: OPENAI_API_KEY Setup

## The Error
```
OPENAI_API_KEY environment variable is not set
```

## Solution

### Option 1: Create/Update `.env.local` File

1. **Create or open** `.env.local` in the project root (`c:\Abby\.env.local`)

2. **Add your OpenAI API key:**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Get your API key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

4. **Save the file** and **restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

### Option 2: Set Environment Variable in Terminal (Windows PowerShell)

For the current session only:
```powershell
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"
npm run dev
```

### Option 3: Set Environment Variable in Terminal (Windows CMD)

For the current session only:
```cmd
set OPENAI_API_KEY=sk-your-actual-api-key-here
npm run dev
```

## Verify It's Working

After setting the key and restarting:

1. Try using the AI chat or input
2. Check the console - you should NOT see the error anymore
3. The AI should respond to your inputs

## Important Notes

- ✅ `.env.local` is **gitignored** - your key will never be committed
- ✅ The API key is **server-side only** - never exposed to the browser
- ⚠️ **Never commit** `.env.local` to git (it's already in `.gitignore`)
- 🔄 **Restart required** - Next.js loads env vars at startup

## Troubleshooting

**Still getting the error?**
1. Make sure `.env.local` is in the **project root** (`c:\Abby\`)
2. Make sure there are **no spaces** around the `=` sign
3. Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
4. **Restart your dev server** - Next.js only reads env vars at startup
5. Check that the key starts with `sk-`

**File not being read?**
- Next.js reads `.env.local` automatically
- If still not working, check `next.config.js` hasn't overridden env loading
- Try removing `.next` folder and restart: `rm -rf .next && npm run dev`
