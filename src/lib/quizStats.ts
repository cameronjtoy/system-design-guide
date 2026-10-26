import { useSyncExternalStore } from 'react'
import { readStorage, writeStorage } from './storage'

// Quiz results, kept in this browser only. Keyed by question id
// ("<principle-slug>:<index>" or "gen:<drill>").

const KEY = 'quiz'

export interface QuestionStat {
  /** Times answered. */
  n: number
  /** Times answered correctly. */
  c: number
  /** Whether the latest answer was correct. */
  last: boolean
}

type Stats = Record<string, QuestionStat>

function load(): Stats {
  const raw = readStorage<{ results?: Stats }>(KEY, {})
  return raw && typeof raw.results === 'object' && raw.results ? raw.results : {}
}

let stats = load()
const listeners = new Set<() => void>()

function commit(next: Stats) {
  stats = next
  writeStorage(KEY, { results: next })
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === `sdg:${KEY}`) {
      stats = load()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useQuizStats(): Readonly<Stats> {
  return useSyncExternalStore(subscribe, () => stats)
}

export function recordAnswer(id: string, correct: boolean) {
  const prev = stats[id] ?? { n: 0, c: 0, last: false }
  commit({ ...stats, [id]: { n: prev.n + 1, c: prev.c + (correct ? 1 : 0), last: correct } })
}

export function resetQuizStats() {
  commit({})
}

/** Totals over a set of stats, optionally limited to ids matching a filter. */
export function summarize(all: Readonly<Stats>, filter: (id: string) => boolean = () => true) {
  let answered = 0
  let correct = 0
  let missed = 0
  for (const [id, s] of Object.entries(all)) {
    if (!filter(id)) continue
    answered += s.n
    correct += s.c
    if (!s.last) missed += 1
  }
  return { answered, correct, missed }
}
