import type { Item, Scene } from '../types'

// Four GPU batch slots; letters are requests, '·' an idle slot.
const slots = (cells: string[]): Item[] =>
  cells.map((c) => (c === '·' ? { label: '', tone: 'muted' } : { label: c, tone: 'active' }))

const scene: Scene = {
  title: 'Static vs continuous batching on a GPU',
  height: 250,
  decor: [
    { type: 'region', x: 8, y: 10, w: 404, h: 108, label: 'Static batching' },
    { type: 'region', x: 8, y: 130, w: 404, h: 108, label: 'Continuous batching' },
  ],
  nodes: [
    { id: 'q1', x: 70, y: 70, w: 96, h: 46, label: 'Waiting', sub: 'E, F' },
    { id: 's', x: 270, y: 70, w: 190, h: 58, label: 'GPU batch', items: slots(['A', 'B', 'C', 'D']) },
    { id: 'q2', x: 70, y: 190, w: 96, h: 46, label: 'Waiting', sub: 'E, F' },
    { id: 'c', x: 270, y: 190, w: 190, h: 58, label: 'GPU batch', items: slots(['A', 'B', 'C', 'D']) },
  ],
  edges: [
    { from: 'q1', to: 's' },
    { from: 'q2', to: 'c' },
  ],
  steps: [
    { caption: 'Both GPUs start with 4 requests decoding together. Requests produce very different numbers of tokens before they finish.' },
    {
      caption: 'B and D finish early (short answers). With static batching, their slots sit idle until the whole batch is done.',
      set: { s: { items: slots(['A', '·', 'C', '·']) } },
    },
    {
      caption: 'With continuous batching, the scheduler inserts waiting requests E and F at the very next decoding step.',
      set: { c: { items: slots(['A', 'B', 'C', 'D']) } },
      packets: [
        { from: 'q2', to: 'c', label: 'E' },
        { from: 'q2', to: 'c', label: 'F' },
      ],
      after: { c: { items: slots(['A', 'E', 'C', 'F']) }, q2: { sub: 'none' } },
    },
    {
      caption: 'Static: the GPU keeps working at half capacity while E and F wait for the longest request, A, to finish.',
      set: { s: { items: slots(['A', '·', '·', '·']) } },
    },
    {
      caption: 'Continuous: every slot stays busy. Same GPU, much higher throughput and lower waiting time. This is how vLLM and similar engines serve LLMs.',
      set: { c: { items: slots(['G', 'E', 'H', 'F']) }, q2: { sub: 'new: G, H' } },
    },
  ],
}

export default scene
