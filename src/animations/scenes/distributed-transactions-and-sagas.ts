import type { Scene } from '../types'

const scene: Scene = {
  title: 'A checkout saga with compensation',
  height: 250,
  nodes: [
    { id: 'o', x: 70, y: 125, w: 100, h: 50, label: 'Orchestrator', sub: 'order 77' },
    { id: 'inv', x: 330, y: 45, w: 110, h: 46, label: 'Inventory', sub: '' },
    { id: 'pay', x: 330, y: 125, w: 110, h: 46, label: 'Payments', sub: '' },
    { id: 'ship', x: 330, y: 205, w: 110, h: 46, label: 'Shipping', sub: '' },
  ],
  edges: [
    { from: 'o', to: 'inv' },
    { from: 'o', to: 'pay' },
    { from: 'o', to: 'ship' },
  ],
  steps: [
    { caption: 'Checkout touches three services, each with its own database. There is no single transaction across them, so we run a saga: a sequence of local steps.' },
    {
      caption: 'Step 1: reserve the items. Inventory commits that locally.',
      packets: [
        { from: 'o', to: 'inv', label: 'reserve' },
        { from: 'inv', to: 'o', label: 'done', tone: 'ok', phase: 1 },
      ],
      after: { inv: { sub: 'reserved', tone: 'active' } },
    },
    {
      caption: 'Step 2: charge the card, with an idempotency key. Payments commits.',
      packets: [
        { from: 'o', to: 'pay', label: 'charge' },
        { from: 'pay', to: 'o', label: 'done', tone: 'ok', phase: 1 },
      ],
      after: { pay: { sub: 'charged $80', tone: 'active' } },
    },
    {
      caption: 'Step 3: create the shipment. It fails: the address can’t be delivered to.',
      packets: [
        { from: 'o', to: 'ship', label: 'ship' },
        { from: 'ship', to: 'o', label: 'failed', tone: 'error', phase: 1 },
      ],
      after: { ship: { sub: 'failed', tone: 'error' } },
    },
    {
      caption: 'The saga can’t roll back committed steps, so it runs compensations in reverse order. First, refund the payment…',
      packets: [{ from: 'o', to: 'pay', label: 'refund', tone: 'warn' }],
      after: { pay: { sub: 'refunded', tone: 'warn' } },
    },
    {
      caption: '…then release the reserved items. The system ends in a consistent state, and the order is marked failed.',
      packets: [{ from: 'o', to: 'inv', label: 'release', tone: 'warn' }],
      after: { inv: { sub: 'released', tone: 'warn' }, o: { sub: 'order 77: failed' } },
    },
  ],
}

export default scene
