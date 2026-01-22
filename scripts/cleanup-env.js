#!/usr/bin/env node
/**
 * Clean up .env.local by removing duplicate/empty OPENAI_API_KEY lines
 * Keeps only the first non-empty OPENAI_API_KEY line
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('✅ No .env.local file found (nothing to clean)')
  process.exit(0)
}

const content = fs.readFileSync(envPath, 'utf8')
const lines = content.split(/\r?\n/g)

let foundValidKey = false
const cleaned = []

for (const line of lines) {
  const trimmed = line.trim()
  
  // Keep non-OPENAI_API_KEY lines as-is
  if (!trimmed.startsWith('OPENAI_API_KEY')) {
    cleaned.push(line)
    continue
  }
  
  // Check if this line has a non-empty value
  const m = trimmed.match(/^OPENAI_API_KEY\s*[:=]\s*(.*)$/)
  if (!m) {
    cleaned.push(line)
    continue
  }
  
  const value = m[1].trim()
  
  // If this is the first valid key, keep it
  if (!foundValidKey && value) {
    foundValidKey = true
    cleaned.push(line)
    console.log('✅ Kept first valid OPENAI_API_KEY line')
  } else if (!value) {
    console.log('🗑️  Removed empty OPENAI_API_KEY line')
  } else {
    console.log('🗑️  Removed duplicate OPENAI_API_KEY line')
  }
}

fs.writeFileSync(envPath, cleaned.join('\n'), 'utf8')
console.log('\n✅ Cleaned .env.local')
console.log('\n⚠️  NEXT STEP: The current key is INVALID (OpenAI returns 401).')
console.log('   You MUST get a new key:')
console.log('   1. Go to: https://platform.openai.com/api-keys')
console.log('   2. Click "Create new secret key"')
console.log('   3. Copy the NEW key (starts with sk-)')
console.log('   4. Update .env.local: OPENAI_API_KEY=sk-<your-new-key>')
console.log('   5. Restart: npm run dev')
