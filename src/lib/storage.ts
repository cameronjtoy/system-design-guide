// localStorage can be missing or throw (private mode, blocked site data), so
// every access is guarded and callers get a fallback instead of an exception.

const PREFIX = 'sdg:'

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    if (value === undefined) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Not persisted; the in-memory state still works for this visit.
  }
}
