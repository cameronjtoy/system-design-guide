import type { Scene } from '../types'

const scene: Scene = {
  title: 'A circuit breaker: closed, open, half-open',
  height: 230,
  nodes: [
    { id: 'svc', x: 60, y: 115, w: 86, label: 'Checkout' },
    { id: 'cb', x: 210, y: 115, w: 110, h: 50, label: 'Breaker', sub: 'CLOSED', tone: 'ok' },
    { id: 'dep', x: 360, y: 115, w: 96, h: 46, label: 'Reviews', sub: 'healthy' },
    { id: 'fb', x: 210, y: 205, w: 120, h: 40, label: 'Fallback: hide reviews', hidden: true },
  ],
  edges: [
    { from: 'svc', to: 'cb' },
    { from: 'cb', to: 'dep' },
    { from: 'cb', to: 'fb', dashed: true, hidden: true },
  ],
  steps: [
    { caption: 'Calls to the reviews service pass through a circuit breaker. While it’s CLOSED, calls go straight through.' },
    {
      caption: 'Normal traffic: request in, response out.',
      packets: [
        { from: 'svc', to: 'cb' },
        { from: 'cb', to: 'dep', phase: 1 },
        { from: 'dep', to: 'cb', tone: 'ok', phase: 2 },
      ],
    },
    {
      caption: 'Reviews starts timing out. The breaker counts the failures…',
      set: { dep: { tone: 'error', sub: 'timing out' } },
      packets: [
        { from: 'cb', to: 'dep', label: '✗' },
        { from: 'dep', to: 'cb', label: 'timeout', tone: 'error', phase: 1 },
      ],
      after: { cb: { tone: 'warn', sub: 'CLOSED · 5 failures' } },
    },
    {
      caption: 'Past the threshold it trips OPEN. Calls now fail instantly without waiting on the broken service, and the page uses a fallback.',
      set: { cb: { tone: 'error', sub: 'OPEN' }, fb: { hidden: false } },
      edges: { 'cb>dep': { cut: true, tone: 'error' }, 'cb>fb': { hidden: false } },
      packets: [
        { from: 'svc', to: 'cb' },
        { from: 'cb', to: 'fb', label: 'fail fast', tone: 'warn', phase: 1 },
      ],
    },
    {
      caption: 'Checkout’s threads aren’t tied up waiting, and reviews gets room to recover instead of being hammered by retries.',
      set: { dep: { tone: 'warn', sub: 'recovering' } },
    },
    {
      caption: 'After a cool-down the breaker goes HALF-OPEN and lets one trial request through.',
      set: { cb: { tone: 'warn', sub: 'HALF-OPEN' }, dep: { tone: 'neutral', sub: 'healthy' } },
      edges: { 'cb>dep': { cut: false, tone: undefined } },
      packets: [
        { from: 'cb', to: 'dep', label: 'trial' },
        { from: 'dep', to: 'cb', label: 'ok', tone: 'ok', phase: 1 },
      ],
    },
    {
      caption: 'The trial succeeds, so the breaker CLOSES and normal traffic resumes. Had it failed, the breaker would reopen.',
      set: { cb: { tone: 'ok', sub: 'CLOSED' }, fb: { hidden: true } },
      edges: { 'cb>fb': { hidden: true } },
    },
  ],
}

export default scene
