# OpenAI Integration Setup

## Environment Variable

Create a `.env.local` file in the project root with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:**
- This file is gitignored and never committed
- The API key is server-side only (never exposed to client)
- Get your key from: https://platform.openai.com/api-keys

## How It Works

1. **Rule-based interpreter runs FIRST** - Fast, deterministic pattern matching
2. **If confidence >= 0.7** - Return rule-based result immediately (no OpenAI call)
3. **If confidence < 0.7** - Call OpenAI as fallback for unclear inputs
4. **Strict validation** - OpenAI output is validated against AIIntent schema
5. **Fallback safety** - If OpenAI fails, return rule-based result

## Model Used

- **Model:** `gpt-4o-mini` (cost-efficient)
- **Temperature:** 0.3 (low for consistent output)
- **Response Format:** JSON object (structured output)
- **Max Tokens:** 500

## Testing

After setting up `.env.local`:

1. Run `npm run dev`
2. Test with unclear inputs that rule-based interpreter can't handle
3. Verify OpenAI is only called when confidence < 0.7

## Cost Considerations

- OpenAI is only called when rule-based confidence is low
- Most common inputs will use rule-based (free, fast)
- Only ambiguous/unclear inputs trigger OpenAI
- Using `gpt-4o-mini` keeps costs low
