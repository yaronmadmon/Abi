# Where Is My OpenAI Key? How to View & Manage It

Your OpenAI API key is used by the app via the `OPENAI_API_KEY` environment variable. Here’s where it lives and how to view or change it.

---

## 1. Local development (on your machine)

**File:** `c:\Abby\.env.local` (project root)

**Steps to view or edit:**

1. Open the project in Cursor/VS Code.
2. In the file explorer, open **`.env.local`** at the project root.
   - If you don’t see it, it may be hidden. Use **File → Open File** and go to `c:\Abby\.env.local`.
3. Find the line: `OPENAI_API_KEY=sk-...`
4. The part after `=` is your key. You can copy it, or replace it with a new key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
5. Save the file.
6. **Restart the dev server** (`Ctrl+C`, then `npm run dev`) so Next.js picks up changes.

**Rules:** No spaces around `=`, no quotes, only one `OPENAI_API_KEY` line. The app reads it via `ai/serverEnv.ts` → `getOpenAIApiKey()`.

---

## 2. Vercel (production/preview)

**Location:** Vercel project → **Settings** → **Environment Variables**

**Steps to view or edit:**

1. Go to [vercel.com](https://vercel.com) and open your project (e.g. **abbyx**).
2. Click **Settings** → **Environment Variables**.
3. Find **`OPENAI_API_KEY`**. The value is masked (e.g. `sk-••••••••`).
4. To **change** it: use **Edit** or **Add New**, set `OPENAI_API_KEY` and paste your new key, then save.
5. **Redeploy** (e.g. **Deployments** → **Redeploy** on the latest) so the new value is used.

---

## 3. Get or rotate your key

- **Get a key:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → **Create new secret key** → copy it (you won’t see it again).
- **Rotate (invalid/401):** Create a new key, update `OPENAI_API_KEY` in `.env.local` and/or Vercel, then restart/redeploy. See **FIX_OPENAI_KEY.md** for detailed steps.

---

## 4. Quick checks

| Check | Where |
|-------|--------|
| Key exists locally | `c:\Abby\.env.local` has `OPENAI_API_KEY=sk-...` |
| App reads it | `ai/serverEnv.ts` → `getOpenAIApiKey()` |
| Key exists on Vercel | Project → Settings → Environment Variables → `OPENAI_API_KEY` |

Never commit `.env.local` or paste your key in chat, docs, or public repos.
