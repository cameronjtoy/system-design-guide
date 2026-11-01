import type { Scene } from '../types'

const scene: Scene = {
  title: 'Fencing tokens stop a stale leader',
  height: 240,
  nodes: [
    { id: 'lock', x: 210, y: 45, w: 120, h: 46, label: 'Lock service', sub: 'lease → A, token 33' },
    { id: 'a', x: 70, y: 135, w: 96, h: 46, label: 'Worker A', sub: 'token 33', tone: 'ok' },
    { id: 'b', x: 350, y: 135, w: 96, h: 46, label: 'Worker B', sub: 'waiting' },
    { id: 'store', x: 210, y: 205, w: 120, h: 50, shape: 'cylinder', label: 'Storage', sub: 'highest token: 33' },
  ],
  edges: [
    { from: 'lock', to: 'a', dashed: true },
    { from: 'lock', to: 'b', dashed: true },
    { from: 'a', to: 'store' },
    { from: 'b', to: 'store' },
  ],
  steps: [
    { caption: 'Worker A holds the lease, with fencing token 33. Only the leaseholder should write to storage.' },
    {
      caption: 'A writes normally, attaching its token.',
      packets: [{ from: 'a', to: 'store', label: 'write #33' }],
    },
    {
      caption: 'A freezes in a long garbage-collection pause. Its lease expires while it’s frozen, but A doesn’t know that.',
      set: { a: { tone: 'warn', sub: 'paused… (token 33)' } },
    },
    {
      caption: 'The lock service gives the lease to B, with a higher token: 34.',
      packets: [{ from: 'lock', to: 'b', label: 'token 34' }],
      after: { b: { tone: 'ok', sub: 'token 34' }, lock: { sub: 'lease → B, token 34' } },
    },
    {
      caption: 'B writes with token 34. Storage records 34 as the highest token it has seen.',
      packets: [{ from: 'b', to: 'store', label: 'write #34' }],
      after: { store: { sub: 'highest token: 34', tone: 'active' } },
    },
    {
      caption: 'A wakes up, still believing it’s the leader, and tries to write with token 33. Two “leaders” at once is split brain.',
      set: { a: { tone: 'warn', sub: 'thinks it leads' } },
      packets: [{ from: 'a', to: 'store', label: 'write #33', tone: 'warn' }],
    },
    {
      caption: 'Storage rejects it: 33 is lower than 34. The stale leader can’t corrupt data, however late it wakes up.',
      packets: [{ from: 'store', to: 'a', label: 'rejected', tone: 'error' }],
      after: { a: { tone: 'error', sub: 'fenced off' } },
    },
  ],
}

export default scene
