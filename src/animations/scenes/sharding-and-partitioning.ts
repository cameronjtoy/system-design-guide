import type { Scene } from '../types'

const scene: Scene = {
  title: 'Routing by shard key',
  height: 270,
  nodes: [
    { id: 'app', x: 55, y: 135, w: 84, label: 'App' },
    { id: 'router', x: 190, y: 135, w: 100, h: 50, label: 'Router', sub: 'hash(tenant) % 3' },
    { id: 's0', x: 355, y: 50, w: 100, h: 52, shape: 'cylinder', label: 'Shard 0', sub: 'tenants A, D' },
    { id: 's1', x: 355, y: 135, w: 100, h: 52, shape: 'cylinder', label: 'Shard 1', sub: 'tenants B, E' },
    { id: 's2', x: 355, y: 220, w: 100, h: 52, shape: 'cylinder', label: 'Shard 2', sub: 'tenant C' },
  ],
  edges: [
    { from: 'app', to: 'router' },
    { from: 'router', to: 's0' },
    { from: 'router', to: 's1' },
    { from: 'router', to: 's2' },
  ],
  steps: [
    { caption: 'One database can’t hold all the data or absorb all the writes, so rows are split across shards by a shard key: here, the tenant ID.' },
    {
      caption: 'A query for tenant B is hashed and goes to exactly one shard. Each shard holds only part of the data.',
      packets: [
        { from: 'app', to: 'router', label: 'tenant B' },
        { from: 'router', to: 's1', label: 'tenant B', phase: 1 },
      ],
      set: { s1: { tone: 'active' } },
    },
    {
      caption: 'Tenant C’s query goes to shard 2. Different tenants are served in parallel by different machines.',
      set: { s1: { tone: 'neutral' }, s2: { tone: 'active' } },
      packets: [
        { from: 'app', to: 'router', label: 'tenant C' },
        { from: 'router', to: 's2', label: 'tenant C', phase: 1 },
      ],
    },
    {
      caption: 'A query that doesn’t include the shard key (“all orders over $500”) must go to every shard and merge the results: much more expensive.',
      set: { s2: { tone: 'neutral' } },
      packets: [
        { from: 'app', to: 'router', label: 'no key' },
        { from: 'router', to: 's0', phase: 1, tone: 'warn' },
        { from: 'router', to: 's1', phase: 1, tone: 'warn' },
        { from: 'router', to: 's2', phase: 1, tone: 'warn' },
      ],
      after: { s0: { tone: 'warn' }, s1: { tone: 'warn' }, s2: { tone: 'warn' } },
    },
    {
      caption: 'Tenant C becomes huge and its shard runs hot. A good key spreads load evenly; a single giant tenant may need its own shard.',
      set: { s0: { tone: 'neutral' }, s1: { tone: 'neutral' }, s2: { tone: 'error', sub: 'tenant C (hot!)' } },
    },
    {
      caption: 'Splitting into many small logical shards from the start lets you move whole shards to new machines instead of re-splitting data.',
      set: { s2: { tone: 'active', sub: 'tenant C only' }, s1: { sub: 'tenants B, E' }, s0: { sub: 'A, D' } },
    },
  ],
}

export default scene
