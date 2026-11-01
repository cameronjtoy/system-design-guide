import type { Scene } from '../types'

const scene: Scene = {
  title: 'Idempotency keys make retries safe',
  height: 230,
  nodes: [
    { id: 'client', x: 55, y: 115, w: 80, label: 'Client' },
    { id: 'api', x: 210, y: 115, w: 100, h: 50, label: 'Payments API' },
    { id: 'keys', x: 360, y: 55, w: 100, h: 46, label: 'Keys table', sub: 'empty' },
    { id: 'card', x: 360, y: 175, w: 100, h: 46, label: 'Card network', sub: '0 charges' },
  ],
  edges: [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'keys' },
    { from: 'api', to: 'card' },
  ],
  steps: [
    { caption: 'The client wants to charge $50. It generates a unique idempotency key, abc-123, and sends it with the request.' },
    {
      caption: 'The API stores the key (a unique constraint means only one request can claim it), then charges the card.',
      packets: [
        { from: 'client', to: 'api', label: 'charge, abc-123' },
        { from: 'api', to: 'keys', label: 'abc-123', phase: 1 },
        { from: 'api', to: 'card', label: '$50', phase: 2 },
      ],
      after: { keys: { sub: 'abc-123: done', tone: 'active' }, card: { sub: '1 charge', tone: 'active' } },
    },
    {
      caption: 'The response is lost on the way back: a network timeout. The client can’t tell whether the charge happened.',
      packets: [{ from: 'api', to: 'client', label: 'OK', tone: 'error' }],
      edges: { 'client>api': { cut: true, tone: 'error' } },
    },
    {
      caption: 'So it retries with the same key.',
      edges: { 'client>api': { cut: false, tone: undefined } },
      packets: [{ from: 'client', to: 'api', label: 'retry, abc-123' }],
    },
    {
      caption: 'The API finds abc-123 already done and returns the stored result. The card is not charged a second time.',
      packets: [
        { from: 'api', to: 'keys', label: 'seen?' },
        { from: 'keys', to: 'api', label: 'yes', tone: 'ok', phase: 1 },
        { from: 'api', to: 'client', label: 'same OK', tone: 'ok', phase: 2 },
      ],
      set: { keys: { tone: 'ok' } },
    },
    {
      caption: 'Without the key, the retry would have created a second $50 charge. Exactly-once effects come from at-least-once delivery plus idempotency.',
    },
  ],
}

export default scene
