import type { Scene } from '../types'

const scene: Scene = {
  title: 'Publish once, deliver to every subscriber',
  height: 250,
  nodes: [
    { id: 'orders', x: 60, y: 125, w: 92, h: 46, label: 'Orders', sub: 'publisher' },
    { id: 'topic', x: 210, y: 125, w: 110, h: 46, label: 'Topic', sub: 'OrderPlaced' },
    { id: 'email', x: 355, y: 40, w: 96, label: 'Email' },
    { id: 'stock', x: 355, y: 100, w: 96, label: 'Inventory' },
    { id: 'stats', x: 355, y: 160, w: 96, label: 'Analytics' },
    { id: 'fraud', x: 355, y: 220, w: 96, label: 'Fraud check', hidden: true },
  ],
  edges: [
    { from: 'orders', to: 'topic' },
    { from: 'topic', to: 'email' },
    { from: 'topic', to: 'stock' },
    { from: 'topic', to: 'stats' },
    { from: 'topic', to: 'fraud', hidden: true },
  ],
  steps: [
    { caption: 'The orders service publishes events to a topic. It doesn’t know or care who listens.' },
    {
      caption: 'An order is placed. The service publishes one OrderPlaced event…',
      packets: [{ from: 'orders', to: 'topic', label: 'OrderPlaced' }],
      set: { topic: { tone: 'active' } },
    },
    {
      caption: '…and the topic delivers a copy to every subscriber, which each react independently.',
      packets: [
        { from: 'topic', to: 'email', label: 'event' },
        { from: 'topic', to: 'stock', label: 'event' },
        { from: 'topic', to: 'stats', label: 'event' },
      ],
      after: { email: { tone: 'active' }, stock: { tone: 'active' }, stats: { tone: 'active' } },
    },
    {
      caption: 'A new team adds a fraud check by subscribing. The orders service didn’t change at all: that’s the decoupling.',
      set: { fraud: { hidden: false, tone: 'ok' }, email: { tone: 'neutral' }, stock: { tone: 'neutral' }, stats: { tone: 'neutral' } },
      edges: { 'topic>fraud': { hidden: false } },
    },
    {
      caption: 'The next event reaches all four. The flip side: dependencies are invisible, so event schemas must be versioned carefully.',
      packets: [
        { from: 'orders', to: 'topic', label: 'OrderPlaced' },
        { from: 'topic', to: 'email', phase: 1 },
        { from: 'topic', to: 'stock', phase: 1 },
        { from: 'topic', to: 'stats', phase: 1 },
        { from: 'topic', to: 'fraud', phase: 1 },
      ],
    },
  ],
}

export default scene
