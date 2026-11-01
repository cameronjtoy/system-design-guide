import type { Scene } from '../types'

const scene: Scene = {
  title: 'Retries with exponential backoff and jitter',
  height: 250,
  nodes: [
    { id: 'c1', x: 55, y: 45, w: 76, label: 'Client 1' },
    { id: 'c2', x: 55, y: 105, w: 76, label: 'Client 2' },
    { id: 'c3', x: 55, y: 165, w: 76, label: 'Client 3' },
    { id: 'c4', x: 55, y: 225, w: 76, label: 'Client 4' },
    { id: 'svc', x: 330, y: 135, w: 120, h: 50, label: 'Service', sub: 'recovering' },
  ],
  edges: [
    { from: 'c1', to: 'svc' },
    { from: 'c2', to: 'svc' },
    { from: 'c3', to: 'svc' },
    { from: 'c4', to: 'svc' },
  ],
  steps: [
    { caption: 'A service had a blip and every client’s request failed at the same moment. Now they all want to retry.' },
    {
      caption: 'Naive retries: everyone retries immediately, together. The recovering service is hit by a synchronized wave and falls over again.',
      set: { svc: { tone: 'error', sub: 'overloaded' } },
      packets: [
        { from: 'c1', to: 'svc', tone: 'error' },
        { from: 'c2', to: 'svc', tone: 'error' },
        { from: 'c3', to: 'svc', tone: 'error' },
        { from: 'c4', to: 'svc', tone: 'error' },
      ],
    },
    {
      caption: 'Exponential backoff: wait 100 ms, then 200, 400, 800… Each retry waits longer, easing the pressure. But clients that failed together still retry together.',
      set: { svc: { tone: 'warn', sub: 'recovering' } },
      packets: [
        { from: 'c1', to: 'svc', tone: 'warn', phase: 1 },
        { from: 'c2', to: 'svc', tone: 'warn', phase: 1 },
        { from: 'c3', to: 'svc', tone: 'warn', phase: 1 },
        { from: 'c4', to: 'svc', tone: 'warn', phase: 1 },
      ],
    },
    {
      caption: 'Add jitter: each client waits a random amount within its backoff window. Retries spread out over time and the service recovers.',
      set: { svc: { tone: 'ok', sub: 'healthy' } },
      packets: [
        { from: 'c3', to: 'svc', tone: 'ok' },
        { from: 'c1', to: 'svc', tone: 'ok', phase: 1 },
        { from: 'c4', to: 'svc', tone: 'ok', phase: 2 },
        { from: 'c2', to: 'svc', tone: 'ok', phase: 3 },
      ],
    },
    {
      caption: 'Also: cap the number of retries, only retry idempotent requests, and retry at one layer. 3 retries at each of 4 layers is 81 attempts at the bottom.',
    },
  ],
}

export default scene
