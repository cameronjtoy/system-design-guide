import type { Item, Scene } from '../types'

const queue = (n: number, tone: 'active' | 'warn' | 'error' = 'active'): Item[] =>
  Array.from({ length: 6 }, (_, i) => (i < n ? { label: '', tone } : ''))

const scene: Scene = {
  title: 'Load shedding with a bounded queue',
  height: 240,
  nodes: [
    { id: 'in', x: 55, y: 120, w: 80, label: 'Traffic', sub: 'normal' },
    { id: 'q', x: 210, y: 120, w: 130, h: 60, label: 'Bounded queue', sub: 'max 6', items: queue(1) },
    { id: 'svc', x: 365, y: 120, w: 80, label: 'Workers', sub: 'busy' },
  ],
  edges: [
    { from: 'in', to: 'q' },
    { from: 'q', to: 'svc' },
  ],
  steps: [
    { caption: 'Requests wait in a queue in front of the workers. Workers can finish about 100 requests a second.' },
    {
      caption: 'Traffic spikes to 3× capacity. The queue fills faster than workers drain it.',
      set: { in: { sub: '3× capacity', tone: 'warn' } },
      packets: [
        { from: 'in', to: 'q' },
        { from: 'in', to: 'q', phase: 1 },
        { from: 'q', to: 'svc', phase: 1 },
        { from: 'in', to: 'q', phase: 2 },
      ],
      after: { q: { items: queue(4, 'warn') } },
    },
    {
      caption: 'An unbounded queue would keep growing: every request waits longer, times out after doing work, and useful throughput collapses.',
      after: { q: { items: queue(6, 'error'), tone: 'error' } },
      packets: [
        { from: 'in', to: 'q', tone: 'warn' },
        { from: 'in', to: 'q', tone: 'warn', phase: 1 },
      ],
    },
    {
      caption: 'A bounded queue sheds load instead: once it’s full, new requests are rejected immediately with 503 and a retry hint.',
      set: { q: { tone: 'warn' } },
      packets: [
        { from: 'in', to: 'q' },
        { from: 'q', to: 'in', label: '503', tone: 'error', phase: 1 },
      ],
    },
    {
      caption: 'Requests that are accepted still finish quickly. Shed low-priority work first (prefetches, analytics) and keep critical calls like checkout.',
      packets: [
        { from: 'q', to: 'svc', tone: 'ok' },
        { from: 'q', to: 'svc', tone: 'ok', phase: 1 },
      ],
      after: { q: { items: queue(4, 'active'), tone: 'neutral' } },
    },
  ],
}

export default scene
