import type { Scene } from '../types'

const scene: Scene = {
  title: 'Fan-out makes rare slowness common',
  height: 270,
  nodes: [
    { id: 'u', x: 50, y: 135, w: 70, label: 'User' },
    { id: 'agg', x: 165, y: 135, w: 96, h: 50, label: 'Aggregator', sub: 'waits for all' },
    { id: 'b1', x: 355, y: 35, w: 96, h: 38, label: 'Shard 1', sub: '' },
    { id: 'b2', x: 355, y: 85, w: 96, h: 38, label: 'Shard 2', sub: '' },
    { id: 'b3', x: 355, y: 135, w: 96, h: 38, label: 'Shard 3', sub: '' },
    { id: 'b4', x: 355, y: 185, w: 96, h: 38, label: 'Shard 4', sub: '' },
    { id: 'b5', x: 355, y: 235, w: 96, h: 38, label: 'Shard 5', sub: '' },
  ],
  edges: [
    { from: 'u', to: 'agg' },
    { from: 'agg', to: 'b1' },
    { from: 'agg', to: 'b2' },
    { from: 'agg', to: 'b3' },
    { from: 'agg', to: 'b4' },
    { from: 'agg', to: 'b5' },
  ],
  steps: [
    { caption: 'A search request fans out to 5 shards in parallel, and the aggregator must wait for all of them before answering.' },
    {
      caption: 'Four shards answer in 10 ms. Shard 4 hits a garbage-collection pause and takes 300 ms.',
      packets: [
        { from: 'agg', to: 'b1' },
        { from: 'agg', to: 'b2' },
        { from: 'agg', to: 'b3' },
        { from: 'agg', to: 'b4' },
        { from: 'agg', to: 'b5' },
        { from: 'b1', to: 'agg', tone: 'ok', phase: 1 },
        { from: 'b2', to: 'agg', tone: 'ok', phase: 1 },
        { from: 'b3', to: 'agg', tone: 'ok', phase: 1 },
        { from: 'b5', to: 'agg', tone: 'ok', phase: 1 },
      ],
      after: { b4: { tone: 'warn', sub: 'GC pause…' } },
    },
    {
      caption: 'The whole request is as slow as its slowest part: 300 ms. If each shard is slow 1% of the time, 100 shards make about 63% of requests slow.',
      packets: [{ from: 'b4', to: 'agg', label: '300 ms', tone: 'warn' }],
      after: { u: { tone: 'warn' } },
    },
    {
      caption: 'Hedged request: if shard 4 hasn’t answered by the 95th-percentile time, send the same query to another replica and use whichever answers first.',
      set: { b4: { tone: 'neutral', sub: 'replica 4b' }, u: { tone: 'neutral' } },
      packets: [
        { from: 'agg', to: 'b4', label: 'hedge' },
        { from: 'b4', to: 'agg', label: '12 ms', tone: 'ok', phase: 1 },
      ],
    },
    {
      caption: 'A few percent extra load buys a much better p99. That’s why tail latency, not the average, drives designs that fan out widely.',
      set: { u: { tone: 'ok' } },
    },
  ],
}

export default scene
