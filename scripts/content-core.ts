// Reads every MDX file under src/content, validates its frontmatter and builds
// the manifest the app imports. Used by the Vite plugin and by
// `npm run check:content`. Written with erasable TypeScript only so Node can
// run it directly.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep, basename } from 'node:path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import {
  CATEGORIES,
  COLLECTIONS,
  DIFFICULTIES,
  type CollectionId,
  type Entry,
  type Heading,
  type SearchDoc,
  type Source,
} from '../src/content/meta.ts'
import { PATHS } from '../src/content/paths.ts'

export interface Problem {
  file: string
  message: string
  level: 'error' | 'warning'
}

interface InternalLink {
  file: string
  target: string
}

export interface LoadResult {
  entries: Entry[]
  searchDocs: SearchDoc[]
  problems: Problem[]
}

const WORDS_PER_MINUTE = 220
const SEARCH_BODY_CHARS = 2000

function walk(dir: string): string[] {
  let out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out = out.concat(walk(full))
    else if (name.endsWith('.mdx')) out.push(full)
  }
  return out.sort()
}

// Strip inline markdown so heading text matches what rehype-slug sees.
function inlineText(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim()
}

function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let inFence = false
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (inFence) continue
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const text = inlineText(m[2])
    const id = slugger.slug(text)
    const depth = m[1].length
    if (depth === 2 || depth === 3) headings.push({ depth, text, id })
  }
  return headings
}

function plainText(body: string): string {
  return body
    .replace(/(```|~~~)[\s\S]*?\1/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*(import|export)\s.*$/gm, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function asStringArray(value: unknown): string[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) return null
  return value as string[]
}

function asSources(value: unknown): Source[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value)) return null
  const out: Source[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const { title, url } = item as Record<string, unknown>
    if (typeof title !== 'string' || typeof url !== 'string') return null
    out.push({ title, url })
  }
  return out
}

function dateString(value: unknown): string | null {
  // YAML parses unquoted dates into Date objects.
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return null
}

export function loadContent(root: string): LoadResult {
  const contentDir = join(root, 'src', 'content')
  const problems: Problem[] = []
  const entries: Entry[] = []
  const searchDocs: SearchDoc[] = []
  const links: InternalLink[] = []
  const collectionIds = new Set(COLLECTIONS.map((c) => c.id))
  const categoryIds = new Set(CATEGORIES.map((c) => c.id))

  for (const fullPath of walk(contentDir)) {
    const rel = relative(contentDir, fullPath).split(sep)
    const file = '/' + relative(root, fullPath).split(sep).join('/')
    const error = (message: string) => problems.push({ file, message, level: 'error' })
    const collection = rel[0] as CollectionId
    if (!collectionIds.has(collection)) {
      error(`"${rel[0]}" is not a known collection folder`)
      continue
    }

    const raw = readFileSync(fullPath, 'utf8')
    let parsed: matter.GrayMatterFile<string>
    try {
      parsed = matter(raw)
    } catch (e) {
      error(`frontmatter is not valid YAML: ${(e as Error).message}`)
      continue
    }
    const fm = parsed.data as Record<string, unknown>
    const body = parsed.content
    const slug = basename(fullPath, '.mdx')

    if (fm.draft === true) continue
    if (typeof fm.title !== 'string' || !fm.title) error('missing "title"')
    if (typeof fm.summary !== 'string' || !fm.summary) error('missing "summary"')
    const tags = asStringArray(fm.tags)
    if (!tags) error('"tags" must be a list of strings')
    const sources = asSources(fm.sources)
    if (!sources) error('"sources" must be a list of { title, url }')
    for (const s of sources ?? []) {
      if (!/^https:\/\//.test(s.url)) error(`source "${s.title}" must use an https URL`)
    }

    const words = plainText(body).split(' ').length
    const base = {
      slug,
      file,
      title: String(fm.title ?? slug),
      summary: String(fm.summary ?? ''),
      tags: tags ?? [],
      sources: sources ?? [],
      headings: extractHeadings(body),
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    }

    let entry: Entry | null = null
    if (collection === 'principles') {
      const category = rel.length === 3 ? rel[1] : ''
      if (!categoryIds.has(category)) {
        error('principles must live in a category folder, e.g. principles/caching/<slug>.mdx')
      }
      if (!DIFFICULTIES.includes(fm.difficulty as never)) {
        error(`"difficulty" must be one of ${DIFFICULTIES.join(', ')}`)
      }
      if (typeof fm.order !== 'number') error('missing numeric "order"')
      const related = asStringArray(fm.related)
      const companies = asStringArray(fm.companies)
      if (!related) error('"related" must be a list of principle slugs')
      if (!companies) error('"companies" must be a list of strings')
      entry = {
        ...base,
        collection,
        category,
        difficulty: fm.difficulty as (typeof DIFFICULTIES)[number],
        order: typeof fm.order === 'number' ? fm.order : 999,
        related: related ?? [],
        companies: companies ?? [],
      }
    } else if (collection === 'practice') {
      if (!DIFFICULTIES.includes(fm.difficulty as never)) {
        error(`"difficulty" must be one of ${DIFFICULTIES.join(', ')}`)
      }
      if (typeof fm.order !== 'number') error('missing numeric "order"')
      const principles = asStringArray(fm.principles)
      if (!principles || principles.length === 0) {
        error('"principles" must list at least one principle slug')
      }
      entry = {
        ...base,
        collection,
        difficulty: fm.difficulty as (typeof DIFFICULTIES)[number],
        order: typeof fm.order === 'number' ? fm.order : 999,
        principles: principles ?? [],
      }
    } else {
      if (typeof fm.company !== 'string' || !fm.company) error('missing "company"')
      const principles = asStringArray(fm.principles)
      if (!principles || principles.length === 0) {
        error('"principles" must list at least one principle slug')
      }
      if (collection === 'postmortems') {
        const date = dateString(fm.date)
        if (!date) error('"date" must be YYYY-MM-DD')
        if (typeof fm.impact !== 'string' || !fm.impact) error('missing "impact"')
        if (fm.duration !== undefined && typeof fm.duration !== 'string') {
          error('"duration" must be a string')
        }
        entry = {
          ...base,
          collection,
          company: String(fm.company ?? ''),
          date: date ?? '1970-01-01',
          duration: fm.duration as string | undefined,
          impact: String(fm.impact ?? ''),
          principles: principles ?? [],
        }
      } else {
        if (typeof fm.year !== 'number') error('missing numeric "year"')
        entry = {
          ...base,
          collection,
          company: String(fm.company ?? ''),
          year: typeof fm.year === 'number' ? fm.year : 0,
          principles: principles ?? [],
        }
      }
    }

    entries.push(entry)
    for (const m of body.matchAll(/\]\((\/[a-z-]+\/[a-z0-9-]+)\)/g)) links.push({ file, target: m[1] })
    searchDocs.push({
      id: `${collection}/${slug}`,
      collection,
      slug,
      title: entry.title,
      summary: entry.summary,
      tags: [...entry.tags, 'company' in entry ? entry.company : ''].join(' ').trim(),
      headings: entry.headings.map((h) => h.text).join(' '),
      body: plainText(body).slice(0, SEARCH_BODY_CHARS),
    })
  }

  // Slugs are URLs, so they must be unique within a collection.
  const seen = new Map<string, string>()
  for (const e of entries) {
    const key = `${e.collection}/${e.slug}`
    const prev = seen.get(key)
    if (prev) problems.push({ file: e.file, message: `slug "${e.slug}" is also used by ${prev}`, level: 'error' })
    seen.set(key, e.file)
  }

  // Cross references may point at pages a later phase adds, so an unknown slug
  // is a warning unless the check runs in strict mode.
  const principleSlugs = new Set(entries.filter((e) => e.collection === 'principles').map((e) => e.slug))
  for (const e of entries) {
    const refs = e.collection === 'principles' ? e.related : e.principles
    for (const ref of refs) {
      if (!principleSlugs.has(ref)) {
        problems.push({ file: e.file, message: `references unknown principle "${ref}"`, level: 'warning' })
      }
    }
  }

  const known = new Set(entries.map((e) => `/${e.collection}/${e.slug}`))
  for (const link of links) {
    if (!known.has(link.target)) {
      problems.push({ file: link.file, message: `links to missing page "${link.target}"`, level: 'warning' })
    }
  }

  // Learning paths are hand-written lists of pages, so a missing page is an error.
  const pathSlugs = new Set<string>()
  for (const path of PATHS) {
    const file = `/src/content/paths.ts#${path.slug}`
    if (pathSlugs.has(path.slug)) problems.push({ file, message: 'duplicate path slug', level: 'error' })
    pathSlugs.add(path.slug)
    for (const step of path.sections.flatMap((s) => s.steps)) {
      if (!known.has(`/${step}`)) problems.push({ file, message: `step "${step}" does not exist`, level: 'error' })
    }
  }

  return { entries, searchDocs, problems }
}
