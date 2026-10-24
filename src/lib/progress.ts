import { useSyncExternalStore } from 'react'
import { readStorage, writeStorage } from './storage'

// Which pages the reader has marked as learned, kept in this browser only.
// Ids are "<collection>/<slug>", the same form learning paths use.

const KEY = 'progress'

interface Stored {
  learned: string[]
}

function load(): Set<string> {
  const raw = readStorage<Stored>(KEY, { learned: [] })
  const list = Array.isArray(raw?.learned) ? raw.learned.filter((x) => typeof x === 'string') : []
  return new Set(list)
}

let learned = load()
const listeners = new Set<() => void>()

function commit(next: Set<string>) {
  learned = next
  writeStorage(KEY, { learned: [...next] })
  listeners.forEach((l) => l())
}

// Keep other open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === `sdg:${KEY}`) {
      learned = load()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The set of learned page ids; re-renders when it changes. */
export function useLearned(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => learned)
}

export function toggleLearned(id: string) {
  const next = new Set(learned)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  commit(next)
}

export function resetProgress() {
  commit(new Set())
}

export function countLearned(ids: string[], set: ReadonlySet<string>): number {
  return ids.reduce((n, id) => n + (set.has(id) ? 1 : 0), 0)
}
