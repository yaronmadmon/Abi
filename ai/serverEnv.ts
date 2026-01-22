/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

let didAttemptLoad = false
let cachedOpenAIKey: string | undefined

function decodeTextFile(buf: Buffer): string {
  // Detect common BOMs (especially Windows Notepad UTF-16).
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    // UTF-16 LE
    return buf.toString('utf16le').replace(/^\uFEFF/, '')
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    // UTF-16 BE (rare). Swap bytes then decode as LE.
    const swapped = Buffer.allocUnsafe(buf.length - 2)
    for (let i = 2; i + 1 < buf.length; i += 2) {
      swapped[i - 2] = buf[i + 1]
      swapped[i - 1] = buf[i]
    }
    return swapped.toString('utf16le').replace(/^\uFEFF/, '')
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    // UTF-8 BOM
    return buf.toString('utf8', 3)
  }
  return buf.toString('utf8')
}

function stripInlineComment(value: string) {
  // Match dotenv-style comments: only strip if "#" is preceded by whitespace.
  const idx = value.search(/\s#/)
  if (idx === -1) return value
  return value.slice(0, idx).trimEnd()
}

function unquote(value: string) {
  const v = value.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  return stripInlineComment(v)
}

function readEnvValueFromFile(filePath: string, key: string): string | undefined {
  try {
    if (!fs.existsSync(filePath)) return undefined
    const buf = fs.readFileSync(filePath)
    const text = decodeTextFile(buf)
    const lines = text.split(/\r?\n/g)
    let found: string | undefined
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      // Support common variants:
      // - KEY=value
      // - KEY: value
      // - export KEY=value
      const m = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*[:=]\s*(.*)$/)
      if (!m) continue
      const k = m[1]
      if (k !== key) continue
      // Use the last occurrence (matches dotenv behavior where later lines override earlier ones)
      const next = unquote(m[2] || '')
      // If a later line sets the value to empty, ignore it so we don't
      // accidentally "unset" a valid key earlier in the file.
      if (next) {
        found = next
      }
    }
    return found
  } catch {
    return undefined
  }
}

function tryLoadOpenAIKeyFromEnvFiles(): string | undefined {
  // In Next, cwd is typically the project root in dev.
  const root = process.cwd()
  const candidates = [
    path.join(root, '.env.local'),
    path.join(root, '.env'),
  ]

  for (const filePath of candidates) {
    const v = readEnvValueFromFile(filePath, 'OPENAI_API_KEY')
    if (v) return v
  }
  return undefined
}

export function getOpenAIApiKey(): string | undefined {
  // Prefer actual process env first (best practice).
  const existing = process.env.OPENAI_API_KEY
  if (existing) return existing

  // Server-only fallback: attempt reading from .env.local if Next didn't load it
  // (common when the file is saved as UTF-16 on Windows).
  if (didAttemptLoad) return cachedOpenAIKey
  didAttemptLoad = true

  const loaded = tryLoadOpenAIKeyFromEnvFiles()
  if (loaded) {
    process.env.OPENAI_API_KEY = loaded
    cachedOpenAIKey = loaded
  }
  return loaded
}

