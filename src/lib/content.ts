import type { ComponentType } from 'react'
import type { MDXProps } from 'mdx/types'
import entries from 'virtual:content'
import {
  CATEGORIES,
  type CaseStudyEntry,
  type CollectionId,
  type Entry,
  type PostmortemEntry,
  type PrincipleEntry,
} from '../content/meta'

type MdxModule = { default: ComponentType<MDXProps> }

// One lazy chunk per page, keyed by file path.
const bodies = import.meta.glob<MdxModule>('/src/content/**/*.mdx')

export function loadBody(entry: Entry): Promise<MdxModule> {
  const load = bodies[entry.file]
  if (!load) return Promise.reject(new Error(`No MDX module for ${entry.file}`))
  return load()
}

export const allEntries: Entry[] = entries

const categoryOrder = new Map(CATEGORIES.map((c, i) => [c.id, i]))

export const principles: PrincipleEntry[] = entries
  .filter((e): e is PrincipleEntry => e.collection === 'principles')
  .sort(
    (a, b) =>
      (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  )

export const postmortems: PostmortemEntry[] = entries
  .filter((e): e is PostmortemEntry => e.collection === 'postmortems')
  .sort((a, b) => b.date.localeCompare(a.date))

export const caseStudies: CaseStudyEntry[] = entries
  .filter((e): e is CaseStudyEntry => e.collection === 'case-studies')
  .sort((a, b) => a.company.localeCompare(b.company) || a.title.localeCompare(b.title))

const bySlug = new Map(entries.map((e) => [`${e.collection}/${e.slug}`, e]))

export function getEntry(collection: CollectionId, slug: string): Entry | undefined {
  return bySlug.get(`${collection}/${slug}`)
}

export function getPrinciple(slug: string): PrincipleEntry | undefined {
  const e = bySlug.get(`principles/${slug}`)
  return e?.collection === 'principles' ? e : undefined
}

export function entryPath(e: Pick<Entry, 'collection' | 'slug'>): string {
  return `/${e.collection}/${e.slug}`
}

export function principlesInCategory(category: string): PrincipleEntry[] {
  return principles.filter((p) => p.category === category)
}

/** Resolve slugs to principles, silently dropping ones that don't exist yet. */
export function resolvePrinciples(slugs: string[]): PrincipleEntry[] {
  return slugs.map(getPrinciple).filter((p): p is PrincipleEntry => Boolean(p))
}

/** Related principles in both directions: listed here, or listing this one. */
export function relatedPrinciples(p: PrincipleEntry): PrincipleEntry[] {
  const slugs = new Set(p.related)
  for (const other of principles) {
    if (other.related.includes(p.slug)) slugs.add(other.slug)
  }
  slugs.delete(p.slug)
  return resolvePrinciples([...slugs])
}

export function postmortemsFor(slug: string): PostmortemEntry[] {
  return postmortems.filter((pm) => pm.principles.includes(slug))
}

export function caseStudiesFor(slug: string): CaseStudyEntry[] {
  return caseStudies.filter((cs) => cs.principles.includes(slug))
}

/** Previous and next principle in reading order. */
export function neighbours(p: PrincipleEntry): { prev?: PrincipleEntry; next?: PrincipleEntry } {
  const i = principles.findIndex((x) => x.slug === p.slug)
  return { prev: principles[i - 1], next: principles[i + 1] }
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
