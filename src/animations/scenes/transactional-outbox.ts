import type { Item, Scene } from '../types'

const outbox = (rows: Item[]): Item[] => rows

const scene: Scene = {
  title: 'The transactional outbox',
  height: 250,
  decor: [{ type: 'region', x: 140, y: 20, w: 150, h: 210, label: 'One database transaction' }],
  nodes: [
    { id: 'svc', x: 60, y: 125, w: 86, label: 'Service' },
    { id: 'orders', x: 215, y: 75, w: 120, h: 46, label: 'orders table', sub: '' },
    { id: 'outbox', x: 215, y: 175, w: 120, h: 58, label: 'outbox table', items: outbox([]) },
    { id: 'relay', x: 360, y: 175, w: 84, label: 'Relay' },
    { id: 'broker', x: 360, y: 75, w: 84, label: 'Broker' },
  ],
  edges: [
    { from: 'svc', to: 'orders' },
    { from: 'svc', to: 'outbox' },
    { from: 'outbox', to: 'relay' },
    { from: 'relay', to: 'broker' },
  ],
  steps: [
    {
      caption: 'The problem: the service must save an order AND publish an OrderPlaced event. If it does one and crashes before the other, the two disagree.',
    },
    {
      caption: 'Instead, it writes the order row and an event row into an outbox table in the same transaction. Both commit, or neither does.',
      packets: [
        { from: 'svc', to: 'orders', label: 'order 9' },
        { from: 'svc', to: 'outbox', label: 'event' },
      ],
      after: { orders: { sub: 'order 9', tone: 'active' }, outbox: { items: [{ label: '9', tone: 'active' }] } },
    },
    {
      caption: 'A relay process reads unsent outbox rows, by polling or through change data capture…',
      packets: [{ from: 'outbox', to: 'relay', label: 'event 9' }],
    },
    {
      caption: '…publishes them to the broker, then marks the row as sent.',
      packets: [{ from: 'relay', to: 'broker', label: 'OrderPlaced' }],
      after: { outbox: { items: [{ label: '9', tone: 'ok' }] }, broker: { tone: 'active' } },
    },
    {
      caption: 'If the relay crashes after publishing but before marking the row, it publishes again. Delivery is at-least-once, so consumers dedupe by event ID.',
      set: { broker: { tone: 'neutral' } },
      packets: [{ from: 'relay', to: 'broker', label: 'dup 9', tone: 'warn' }],
    },
  ],
}

export default scene
