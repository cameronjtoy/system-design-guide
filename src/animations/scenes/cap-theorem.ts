import type { Scene } from '../types'

const scene: Scene = {
  title: 'CAP: what happens during a network partition',
  height: 240,
  nodes: [
    { id: 'u1', x: 55, y: 60, w: 80, label: 'User 1' },
    { id: 'u2', x: 365, y: 60, w: 80, label: 'User 2' },
    { id: 'a', x: 120, y: 175, w: 104, h: 52, shape: 'cylinder', label: 'Replica A', sub: 'stock = 1' },
    { id: 'b', x: 300, y: 175, w: 104, h: 52, shape: 'cylinder', label: 'Replica B', sub: 'stock = 1' },
  ],
  edges: [
    { from: 'u1', to: 'a' },
    { from: 'u2', to: 'b' },
    { from: 'a', to: 'b', label: 'replication' },
  ],
  steps: [
    { caption: 'Two replicas in different data centers both hold the item count: 1 left. They normally sync with each other.' },
    {
      caption: 'The network between them fails: a partition. Each side can still talk to its own users, but not to the other replica.',
      edges: { 'a>b': { cut: true, tone: 'error' } },
    },
    {
      caption: 'User 1 buys the last item on replica A. A can’t tell B.',
      packets: [{ from: 'u1', to: 'a', label: 'buy' }],
      after: { a: { sub: 'stock = 0', tone: 'active' } },
    },
    {
      caption: 'Choice 1, consistency (CP): B refuses requests it can’t confirm. User 2 gets an error, but nobody oversells.',
      packets: [
        { from: 'u2', to: 'b', label: 'buy' },
        { from: 'b', to: 'u2', label: 'unavailable', tone: 'error', phase: 1 },
      ],
      set: { b: { tone: 'error', sub: 'refusing writes' } },
    },
    {
      caption: 'Choice 2, availability (AP): B answers from what it knows and sells the item again. Both users succeed, but the item is now oversold.',
      set: { b: { tone: 'warn', sub: 'stock = 1 (stale)' } },
      packets: [
        { from: 'u2', to: 'b', label: 'buy' },
        { from: 'b', to: 'u2', label: 'OK', tone: 'ok', phase: 1 },
      ],
      after: { b: { sub: 'stock = 0' } },
    },
    {
      caption: 'When the network heals, an AP system must reconcile the conflict (cancel an order, apologize). Without a partition, you can have both.',
      edges: { 'a>b': { cut: false, tone: undefined } },
      set: { b: { tone: 'neutral' }, a: { tone: 'neutral' } },
    },
  ],
}

export default scene
