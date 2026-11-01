import type { Scene } from '../types'

const scene: Scene = {
  title: 'A cache stampede, and how coalescing stops it',
  height: 260,
  nodes: [
    { id: 'r1', x: 45, y: 45, w: 66, label: 'Req' },
    { id: 'r2', x: 45, y: 105, w: 66, label: 'Req' },
    { id: 'r3', x: 45, y: 165, w: 66, label: 'Req' },
    { id: 'r4', x: 45, y: 225, w: 66, label: 'Req' },
    { id: 'cache', x: 200, y: 135, w: 104, label: 'Cache', sub: 'home_feed ✓' },
    { id: 'db', x: 360, y: 135, w: 92, h: 52, shape: 'cylinder', label: 'Database', sub: 'idle' },
  ],
  edges: [
    { from: 'r1', to: 'cache' },
    { from: 'r2', to: 'cache' },
    { from: 'r3', to: 'cache' },
    { from: 'r4', to: 'cache' },
    { from: 'cache', to: 'db' },
  ],
  steps: [
    { caption: 'A very popular key (the home feed) is cached. Thousands of requests per second are served from memory.' },
    {
      caption: 'The key’s TTL expires. Every request arriving in that instant misses at once…',
      set: { cache: { tone: 'warn', sub: 'expired' } },
      packets: [
        { from: 'r1', to: 'cache' },
        { from: 'r2', to: 'cache' },
        { from: 'r3', to: 'cache' },
        { from: 'r4', to: 'cache' },
      ],
    },
    {
      caption: '…and all of them run the same expensive query. The database is overwhelmed: that’s a stampede.',
      packets: [
        { from: 'cache', to: 'db', label: 'query', tone: 'error' },
        { from: 'cache', to: 'db', label: 'query', tone: 'error', phase: 1 },
        { from: 'cache', to: 'db', label: 'query', tone: 'error', phase: 2 },
      ],
      set: { db: { tone: 'error', sub: 'overloaded' } },
    },
    {
      caption: 'Fix: request coalescing. The key expires again, but this time only the first miss takes a rebuild lock…',
      set: { db: { tone: 'neutral', sub: 'idle' }, cache: { tone: 'warn', sub: 'expired · locked' } },
      packets: [{ from: 'cache', to: 'db', label: '1 query' }],
      after: { db: { tone: 'active', sub: 'one query' } },
    },
    {
      caption: 'Other requests wait briefly or get the slightly stale value instead of querying too.',
      packets: [
        { from: 'cache', to: 'r2', label: 'stale', tone: 'muted' },
        { from: 'cache', to: 'r3', label: 'stale', tone: 'muted' },
        { from: 'cache', to: 'r4', label: 'stale', tone: 'muted' },
      ],
    },
    {
      caption: 'The single rebuild refills the cache, with a little random jitter on the TTL so popular keys don’t all expire together.',
      packets: [{ from: 'db', to: 'cache', label: 'fresh', tone: 'ok' }],
      after: { cache: { tone: 'ok', sub: 'home_feed ✓' }, db: { tone: 'neutral', sub: 'idle' } },
    },
  ],
}

export default scene
