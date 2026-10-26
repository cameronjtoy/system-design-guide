import { DEFAULT_TOLERANCE, type NumberQuestion, type Question, type QuizBank } from '../content/quizzes/types'

/** A question ready to show, with a stable id for stats. */
export interface QuizItem {
  id: string
  question: Question
  /** Principle the question belongs to, if any. */
  slug?: string
  category: string
}

let bankPromise: Promise<QuizBank> | undefined

/** The question bank is large, so it loads on first use. */
export function loadQuizBank(): Promise<QuizBank> {
  bankPromise ??= import('../content/quizzes/index.ts').then(
    (m) => m.QUIZZES,
    (e) => {
      bankPromise = undefined
      throw e
    },
  )
  return bankPromise
}

export function itemsForPrinciple(bank: QuizBank, slug: string, category: string): QuizItem[] {
  return (bank[slug] ?? []).map((question, i) => ({ id: `${slug}:${i}`, question, slug, category }))
}

const MULTIPLIERS: Record<string, number> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9,
  t: 1e12,
  trillion: 1e12,
}

/**
 * Reads numbers the way people type estimates: "1,500", "1.5k", "2M",
 * "3 billion", "4e6", "99.9%". A trailing unit like "GB" or "requests/s" is
 * ignored because the unit is shown next to the input.
 */
export function parseNumber(input: string): number | undefined {
  const m = input
    .trim()
    .toLowerCase()
    .replace(/[≈~]/g, '')
    .match(/^([-+]?(?:\d[\d,_]*)?\.?\d+(?:e[-+]?\d+)?)\s*(thousand|million|billion|trillion|bn|[kmbt](?![a-z]))?/)
  if (!m) return undefined
  const n = Number(m[1].replace(/[,_]/g, ''))
  if (!Number.isFinite(n)) return undefined
  return n * (m[2] ? MULTIPLIERS[m[2]] : 1)
}

export function isCloseEnough(q: NumberQuestion, value: number): boolean {
  const tol = q.tolerance ?? DEFAULT_TOLERANCE
  if (q.answer === 0) return Math.abs(value) < 1e-9
  return Math.abs(value - q.answer) / Math.abs(q.answer) <= tol + 1e-9
}

const plain = new Intl.NumberFormat('en', { maximumSignificantDigits: 4 })
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 })

/** 1234 → "1,234"; 2_500_000 → "2.5M". */
export function formatNumber(n: number): string {
  return Math.abs(n) >= 1e6 ? compact.format(n) : plain.format(n)
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(list: readonly T[], random: () => number = Math.random): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
