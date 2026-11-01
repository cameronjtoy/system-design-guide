import type { Scene } from '../types'

const scene: Scene = {
  title: 'Quorum reads and writes: N = 3, W = 2, R = 2',
  height: 250,
  nodes: [
    { id: 'w', x: 55, y: 70, w: 80, label: 'Writer' },
    { id: 'r', x: 55, y: 190, w: 80, label: 'Reader' },
    { id: 'a', x: 330, y: 45, w: 104, h: 46, label: 'Replica A', sub: 'x = 1' },
    { id: 'b', x: 330, y: 125, w: 104, h: 46, label: 'Replica B', sub: 'x = 1' },
    { id: 'c', x: 330, y: 205, w: 104, h: 46, label: 'Replica C', sub: 'x = 1' },
  ],
  edges: [
    { from: 'w', to: 'a' },
    { from: 'w', to: 'b' },
    { from: 'w', to: 'c', dashed: true },
    { from: 'r', to: 'b' },
    { from: 'r', to: 'c' },
    { from: 'r', to: 'a', dashed: true },
  ],
  steps: [
    { caption: 'Every key is stored on 3 replicas. A write must reach W = 2 of them; a read must hear from R = 2.' },
    {
      caption: 'The writer sets x = 2. Replicas A and B confirm, which meets W = 2, so the write succeeds. C is slow and misses it.',
      packets: [
        { from: 'w', to: 'a', label: 'x=2' },
        { from: 'w', to: 'b', label: 'x=2' },
        { from: 'a', to: 'w', label: 'ok', tone: 'ok', phase: 1 },
        { from: 'b', to: 'w', label: 'ok', tone: 'ok', phase: 1 },
      ],
      after: { a: { sub: 'x = 2 (v2)', tone: 'active' }, b: { sub: 'x = 2 (v2)', tone: 'active' }, c: { sub: 'x = 1 (v1)', tone: 'warn' } },
    },
    {
      caption: 'A reader asks replicas B and C. C is stale, but B has the new value.',
      packets: [
        { from: 'r', to: 'b' },
        { from: 'r', to: 'c' },
        { from: 'b', to: 'r', label: 'v2', tone: 'ok', phase: 1 },
        { from: 'c', to: 'r', label: 'v1', tone: 'warn', phase: 1 },
      ],
    },
    {
      caption: 'The reader keeps the value with the higher version, x = 2. Because R + W > N (2 + 2 > 3), every read set overlaps every write set.',
    },
    {
      caption: 'The reader also repairs C with the newer value (read repair), so replicas converge.',
      packets: [{ from: 'r', to: 'c', label: 'v2', tone: 'ok' }],
      after: { c: { sub: 'x = 2 (v2)', tone: 'active' } },
    },
    {
      caption: 'With W = 1 and R = 1, writes and reads would be faster, but a read could miss the latest write entirely.',
    },
  ],
}

export default scene
