import type { Item, Scene } from '../types'

const pool = (busy: number, size: number, tone: 'active' | 'error' = 'active'): Item[] =>
  Array.from({ length: size }, (_, i) => (i < busy ? { label: '', tone } : ''))

const scene: Scene = {
  title: 'Bulkheads keep one slow dependency from sinking everything',
  height: 260,
  nodes: [
    { id: 'svc', x: 70, y: 70, w: 110, h: 58, label: 'One shared pool', items: pool(2, 8) },
    { id: 'rec', x: 340, y: 40, w: 110, h: 44, label: 'Recommendations', sub: 'slow' },
    { id: 'pay', x: 340, y: 100, w: 110, h: 44, label: 'Payments', sub: 'fine' },
    { id: 'svc2', x: 70, y: 200, w: 110, h: 58, label: 'Separate pools', sub: 'recs: 3 · payments: 5', items: pool(0, 8) },
    { id: 'rec2', x: 340, y: 175, w: 110, h: 44, label: 'Recommendations', sub: 'slow' },
    { id: 'pay2', x: 340, y: 235, w: 110, h: 44, label: 'Payments', sub: 'fine' },
  ],
  edges: [
    { from: 'svc', to: 'rec' },
    { from: 'svc', to: 'pay' },
    { from: 'svc2', to: 'rec2' },
    { from: 'svc2', to: 'pay2' },
  ],
  steps: [
    { caption: 'Top: one pool of 8 worker threads serves every dependency. Bottom: 3 threads are reserved for recommendations and 5 for payments.' },
    {
      caption: 'Recommendations gets slow. In the shared pool, requests to it pile up and hold threads while they wait…',
      set: { rec: { tone: 'error', sub: 'slow' }, rec2: { tone: 'error', sub: 'slow' } },
      packets: [
        { from: 'svc', to: 'rec', tone: 'error' },
        { from: 'svc', to: 'rec', tone: 'error', phase: 1 },
        { from: 'svc', to: 'rec', tone: 'error', phase: 2 },
      ],
      after: { svc: { items: pool(8, 8, 'error') } },
    },
    {
      caption: '…until every thread is stuck. Payment requests have nowhere to run, so checkout fails even though payments is healthy.',
      set: { pay: { tone: 'error', sub: 'starved' } },
    },
    {
      caption: 'With bulkheads, recommendations can only ever use its 3 threads. They fill up, and extra recommendation calls are rejected fast…',
      set: { svc2: { items: [{ label: '', tone: 'error' }, { label: '', tone: 'error' }, { label: '', tone: 'error' }, '', '', '', '', ''] } },
      packets: [
        { from: 'svc2', to: 'rec2', tone: 'error' },
        { from: 'svc2', to: 'rec2', tone: 'error', phase: 1 },
      ],
    },
    {
      caption: '…while payments still has its 5 threads. Checkout keeps working; only the recommendations widget degrades.',
      packets: [
        { from: 'svc2', to: 'pay2', tone: 'ok' },
        { from: 'pay2', to: 'svc2', tone: 'ok', phase: 1 },
      ],
      set: { pay2: { tone: 'ok', sub: 'fine' } },
    },
  ],
}

export default scene
