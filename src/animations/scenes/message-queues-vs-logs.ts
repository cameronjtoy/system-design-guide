import type { Item, Scene } from '../types'

const q = (labels: string[]): Item[] => labels.map((l) => ({ label: l, tone: 'active' }))
const logItems = (readA: number, readB: number): Item[] =>
  ['1', '2', '3', '4'].map((l, i) => ({ label: l, tone: i < Math.min(readA, readB) ? 'ok' : i < Math.max(readA, readB) ? 'active' : undefined }))

const scene: Scene = {
  title: 'A work queue vs a log',
  height: 280,
  decor: [
    { type: 'region', x: 8, y: 10, w: 404, h: 122, label: 'Queue: each message goes to one worker, then disappears' },
    { type: 'region', x: 8, y: 148, w: 404, h: 124, label: 'Log: messages stay; each group tracks its own offset' },
  ],
  nodes: [
    { id: 'p1', x: 55, y: 75, w: 76, label: 'Producer' },
    { id: 'queue', x: 205, y: 75, w: 120, h: 56, label: 'Queue', items: q(['1', '2', '3']) },
    { id: 'w1', x: 360, y: 52, w: 84, label: 'Worker 1' },
    { id: 'w2', x: 360, y: 104, w: 84, label: 'Worker 2' },
    { id: 'p2', x: 55, y: 215, w: 76, label: 'Producer' },
    { id: 'log', x: 205, y: 215, w: 120, h: 56, label: 'Log (Kafka)', items: logItems(0, 0) },
    { id: 'ga', x: 360, y: 190, w: 84, h: 44, label: 'Billing', sub: 'offset 0' },
    { id: 'gb', x: 360, y: 245, w: 84, h: 44, label: 'Search', sub: 'offset 0' },
  ],
  edges: [
    { from: 'p1', to: 'queue' },
    { from: 'queue', to: 'w1' },
    { from: 'queue', to: 'w2' },
    { from: 'p2', to: 'log' },
    { from: 'log', to: 'ga' },
    { from: 'log', to: 'gb' },
  ],
  steps: [
    { caption: 'Both hold messages 1–3 (and 4 in the log). Watch what happens to a message after it’s consumed.' },
    {
      caption: 'Queue: worker 1 takes message 1 and worker 2 takes message 2. Each message is processed by exactly one worker.',
      packets: [
        { from: 'queue', to: 'w1', label: '1' },
        { from: 'queue', to: 'w2', label: '2' },
      ],
      after: { queue: { items: q(['3']) } },
    },
    {
      caption: 'Once acknowledged, they’re deleted from the queue. Great for spreading tasks like sending emails or resizing images.',
      packets: [
        { from: 'w1', to: 'queue', label: 'ack', tone: 'ok' },
        { from: 'w2', to: 'queue', label: 'ack', tone: 'ok' },
      ],
    },
    {
      caption: 'Log: billing and search are separate consumer groups. Both read message 1; nothing is deleted.',
      packets: [
        { from: 'log', to: 'ga', label: '1' },
        { from: 'log', to: 'gb', label: '1' },
      ],
      after: { log: { items: logItems(1, 1) }, ga: { sub: 'offset 1' }, gb: { sub: 'offset 1' } },
    },
    {
      caption: 'Billing races ahead to offset 4 while search is slower. Each group moves at its own pace.',
      packets: [
        { from: 'log', to: 'ga', label: '2' },
        { from: 'log', to: 'ga', label: '3', phase: 1 },
        { from: 'log', to: 'ga', label: '4', phase: 2 },
      ],
      after: { log: { items: logItems(4, 1) }, ga: { sub: 'offset 4' } },
    },
    {
      caption: 'Search finds a bug, fixes it and rewinds to offset 0 to reprocess everything. Replay is the superpower of a log.',
      set: { gb: { sub: 'rewind → 0', tone: 'warn' }, log: { items: logItems(4, 0) } },
      packets: [{ from: 'log', to: 'gb', label: '1' }],
    },
  ],
}

export default scene
