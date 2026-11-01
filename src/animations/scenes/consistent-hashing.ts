import type { Scene, SceneNode } from '../types'

// Points on a ring centred at (210, 135).
const at = (deg: number, r = 95) => ({
  x: Math.round(210 + r * Math.cos(((deg - 90) * Math.PI) / 180)),
  y: Math.round(135 + r * Math.sin(((deg - 90) * Math.PI) / 180)),
})

const server = (id: string, label: string, deg: number, hidden = false): SceneNode => ({
  id,
  label,
  ...at(deg),
  w: 44,
  h: 44,
  shape: 'circle',
  tone: 'active',
  hidden,
})

const key = (id: string, deg: number): SceneNode => ({ id, label: id, ...at(deg, 132), w: 34, h: 24 })

const scene: Scene = {
  title: 'Consistent hashing: adding a server moves only a few keys',
  height: 270,
  decor: [{ type: 'ring', cx: 210, cy: 135, r: 95 }],
  nodes: [
    server('A', 'A', 20),
    server('B', 'B', 140),
    server('C', 'C', 260),
    server('D', 'D', 200, true),
    key('k1', 60),
    key('k2', 100),
    key('k3', 170),
    key('k4', 215),
    key('k5', 300),
    key('k6', 345),
  ],
  edges: [
    { from: 'k1', to: 'B', dashed: true },
    { from: 'k2', to: 'B', dashed: true },
    { from: 'k3', to: 'C', dashed: true },
    { from: 'k4', to: 'C', dashed: true },
    { from: 'k5', to: 'A', dashed: true },
    { from: 'k6', to: 'A', dashed: true },
    { from: 'k3', to: 'D', dashed: true, hidden: true, tone: 'active' },
  ],
  steps: [
    { caption: 'Servers and keys are hashed onto the same ring. Each key belongs to the next server clockwise from it.' },
    {
      caption: 'k1 and k2 sit between A and B, so they live on B. k3 and k4 live on C; k5 and k6 wrap around to A.',
      set: { k1: { tone: 'active' }, k2: { tone: 'active' } },
    },
    {
      caption: 'Add server D. It lands on the ring between B and C…',
      set: { k1: { tone: 'neutral' }, k2: { tone: 'neutral' }, D: { hidden: false, tone: 'ok' } },
    },
    {
      caption: '…so only k3, the key between B and D, moves (from C to D). Every other key stays where it was.',
      edges: { 'k3>C': { hidden: true }, 'k3>D': { hidden: false } },
      set: { k3: { tone: 'ok' } },
    },
    {
      caption: 'With plain hash(key) % N, going from 3 to 4 servers would remap most keys. Here roughly 1/N move: far fewer cache misses and less data to copy.',
      set: { k3: { tone: 'neutral' } },
    },
    {
      caption: 'Real systems give each server hundreds of “virtual nodes” around the ring, so load spreads evenly and a new server takes a little from everyone.',
    },
  ],
}

export default scene
