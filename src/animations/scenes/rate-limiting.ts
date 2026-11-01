import type { Item, Scene } from '../types'

const tokens = (n: number, max = 5): Item[] =>
  Array.from({ length: max }, (_, i) => (i < n ? { label: '', tone: 'ok' } : { label: '', tone: 'muted' }))

const scene: Scene = {
  title: 'A token bucket rate limiter',
  height: 240,
  nodes: [
    { id: 'client', x: 55, y: 120, w: 80, label: 'Client' },
    { id: 'bucket', x: 210, y: 120, w: 130, h: 64, label: 'Token bucket', sub: '5 tokens · +1 per second', items: tokens(5) },
    { id: 'api', x: 365, y: 120, w: 80, label: 'API' },
  ],
  edges: [
    { from: 'client', to: 'bucket' },
    { from: 'bucket', to: 'api' },
  ],
  steps: [
    { caption: 'Each API key has a bucket holding up to 5 tokens, refilled at 1 token per second. Every request spends one token.' },
    {
      caption: 'A burst of 3 requests: each takes a token and goes through. Bursts are allowed up to the bucket size.',
      packets: [
        { from: 'client', to: 'bucket', label: '1' },
        { from: 'bucket', to: 'api', label: '1', phase: 1 },
        { from: 'client', to: 'bucket', label: '2', phase: 1 },
        { from: 'bucket', to: 'api', label: '2', phase: 2 },
        { from: 'client', to: 'bucket', label: '3', phase: 2 },
        { from: 'bucket', to: 'api', label: '3', phase: 3 },
      ],
      after: { bucket: { items: tokens(2) } },
    },
    {
      caption: 'Two more requests use up the last tokens. The bucket is empty.',
      packets: [
        { from: 'client', to: 'bucket', label: '4' },
        { from: 'bucket', to: 'api', label: '4', phase: 1 },
        { from: 'client', to: 'bucket', label: '5', phase: 1 },
        { from: 'bucket', to: 'api', label: '5', phase: 2 },
      ],
      after: { bucket: { items: tokens(0), tone: 'warn' } },
    },
    {
      caption: 'The next request finds no token, so it’s rejected with HTTP 429 Too Many Requests and a Retry-After header.',
      packets: [
        { from: 'client', to: 'bucket', label: '6' },
        { from: 'bucket', to: 'client', label: '429', tone: 'error', phase: 1 },
      ],
    },
    {
      caption: 'Two seconds pass and two tokens drip back in. The average rate is capped at 1 per second over time.',
      set: { bucket: { items: tokens(2), tone: 'neutral' } },
    },
    {
      caption: 'The client, honoring Retry-After, tries again and succeeds. In a fleet, the bucket lives in a shared store like Redis and is updated atomically.',
      packets: [
        { from: 'client', to: 'bucket', label: '7' },
        { from: 'bucket', to: 'api', label: '7', phase: 1 },
      ],
      after: { bucket: { items: tokens(1) } },
    },
  ],
}

export default scene
