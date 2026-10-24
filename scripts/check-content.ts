// Validates content frontmatter and cross references.
// Usage: node scripts/check-content.ts [--strict]
// --strict also fails on references to principles that don't exist yet.

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadContent } from './content-core.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const strict = process.argv.includes('--strict')
const { entries, problems } = loadContent(root)

for (const p of problems) {
  const label = p.level === 'error' || strict ? 'error' : 'warn '
  console.log(`${label}  ${p.file}: ${p.message}`)
}

const failures = problems.filter((p) => p.level === 'error' || strict).length
const counts = new Map<string, number>()
for (const e of entries) counts.set(e.collection, (counts.get(e.collection) ?? 0) + 1)
const summary = [...counts].map(([k, v]) => `${v} ${k}`).join(', ')
console.log(`\n${entries.length} pages (${summary}), ${problems.length} problem(s)`)
if (failures > 0) process.exit(1)
