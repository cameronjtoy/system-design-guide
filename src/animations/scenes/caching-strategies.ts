import type { Scene } from '../types'

const scene: Scene = {
  title: 'Cache-aside: hits, misses and writes',
  height: 250,
  nodes: [
    { id: 'app', x: 60, y: 125, w: 84, label: 'App' },
    { id: 'cache', x: 230, y: 55, w: 110, label: 'Cache', sub: 'empty' },
    { id: 'db', x: 230, y: 195, w: 110, h: 50, shape: 'cylinder', label: 'Database' },
    { id: 'note', x: 365, y: 125, w: 90, h: 46, label: 'user:42', sub: 'name = Ana' },
  ],
  edges: [
    { from: 'app', to: 'cache' },
    { from: 'app', to: 'db' },
  ],
  steps: [
    { caption: 'The app needs user 42. With cache-aside, the app checks the cache first and only goes to the database on a miss.' },
    {
      caption: 'Miss: the key isn’t in the cache yet.',
      packets: [
        { from: 'app', to: 'cache', label: 'GET user:42' },
        { from: 'cache', to: 'app', label: 'miss', tone: 'warn', phase: 1 },
      ],
      after: { cache: { tone: 'warn', sub: 'miss' } },
    },
    {
      caption: 'The app reads the database (slow, maybe 10–20 ms)…',
      packets: [
        { from: 'app', to: 'db', label: 'SELECT' },
        { from: 'db', to: 'app', label: 'row', tone: 'ok', phase: 1 },
      ],
      set: { db: { tone: 'active' } },
      after: { db: { tone: 'neutral' } },
    },
    {
      caption: '…then stores the result in the cache with a TTL, so it eventually expires even if nobody invalidates it.',
      packets: [{ from: 'app', to: 'cache', label: 'SET, TTL 5 min' }],
      after: { cache: { tone: 'active', sub: 'user:42 ✓' } },
    },
    {
      caption: 'Hit: the next read is served from memory in about a millisecond. The database isn’t touched.',
      packets: [
        { from: 'app', to: 'cache', label: 'GET user:42' },
        { from: 'cache', to: 'app', label: 'hit', tone: 'ok', phase: 1 },
      ],
      set: { cache: { tone: 'ok', sub: 'hit' } },
    },
    {
      caption: 'Ana renames herself. The app writes the database first…',
      set: { note: { sub: 'name = Ana B.' }, cache: { tone: 'active', sub: 'user:42 (old)' } },
      packets: [{ from: 'app', to: 'db', label: 'UPDATE' }],
    },
    {
      caption: '…then deletes the cache entry rather than overwriting it, so the next read loads the fresh value.',
      packets: [{ from: 'app', to: 'cache', label: 'DEL user:42' }],
      after: { cache: { tone: 'neutral', sub: 'empty' } },
    },
  ],
}

export default scene
