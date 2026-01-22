const fs = require('fs')
const path = require('path')

function safeBool(v) {
  return v ? 'yes' : 'no'
}

function decode(buf) {
  // Minimal decode for inspection. Handles UTF-8 BOM.
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.toString('utf8', 3)
  }
  return buf.toString('utf8')
}

const filePath = path.join(process.cwd(), '.env.local')
console.log('cwd:', process.cwd())
console.log('envFileExists:', safeBool(fs.existsSync(filePath)))
if (!fs.existsSync(filePath)) process.exit(0)

const raw = decode(fs.readFileSync(filePath))
const lines = raw.split(/\r?\n/g)
const hits = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (!line.includes('OPENAI_API_KEY')) continue
  hits.push({ i, line })
}

console.log('linesContainingOPENAI_API_KEY:', hits.length)
for (const h of hits) {
  const original = h.line
  const trimmed = original.trim()
  const isCommented = trimmed.startsWith('#')

  const m = trimmed.match(/^(?:export\s+)?OPENAI_API_KEY\s*([:=])\s*(.*)$/)
  const hasKeySyntax = !!m && !isCommented
  const separator = m ? m[1] : null
  const valueRaw = m ? (m[2] || '') : ''
  const valueTrim = valueRaw.trim()
  const valueLength = hasKeySyntax ? valueTrim.length : 0
  const startsWithSk = hasKeySyntax ? valueTrim.startsWith('sk-') || valueTrim.startsWith('sk-proj-') : false
  const startsWithQuote = hasKeySyntax ? (valueTrim.startsWith('"') || valueTrim.startsWith("'")) : false
  const endsWithQuote = hasKeySyntax ? (valueTrim.endsWith('"') || valueTrim.endsWith("'")) : false

  console.log(
    [
      `line=${h.i + 1}`,
      `commented=${safeBool(isCommented)}`,
      `hasKeySyntax=${safeBool(hasKeySyntax)}`,
      `sep=${separator || '-'}`,
      `valueLength=${valueLength}`,
      `startsWithSk=${safeBool(startsWithSk)}`,
      `startsWithQuote=${safeBool(startsWithQuote)}`,
      `endsWithQuote=${safeBool(endsWithQuote)}`,
    ].join(' ')
  )
}

