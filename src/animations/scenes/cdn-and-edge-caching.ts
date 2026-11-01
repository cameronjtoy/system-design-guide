import type { Scene } from '../types'

const scene: Scene = {
  title: 'A CDN serving from the edge',
  height: 250,
  decor: [
    { type: 'region', x: 8, y: 20, w: 196, h: 210, label: 'Near users (Tokyo)' },
    { type: 'region', x: 290, y: 60, w: 122, h: 130, label: 'Far away (Virginia)' },
  ],
  nodes: [
    { id: 'u1', x: 55, y: 80, w: 70, label: 'User' },
    { id: 'u2', x: 55, y: 180, w: 70, label: 'User' },
    { id: 'edge', x: 155, y: 130, w: 82, h: 52, label: 'CDN edge', sub: 'empty' },
    { id: 'origin', x: 350, y: 130, w: 84, h: 50, label: 'Origin' },
  ],
  edges: [
    { from: 'u1', to: 'edge' },
    { from: 'u2', to: 'edge' },
    { from: 'edge', to: 'origin', label: '~150 ms' },
  ],
  steps: [
    { caption: 'The origin server is in Virginia. Users in Tokyo connect to a nearby CDN edge instead of crossing the Pacific.' },
    {
      caption: 'The first user asks for logo.png. The edge doesn’t have it yet (a miss), so it fetches it from the origin: slow.',
      packets: [
        { from: 'u1', to: 'edge', label: 'logo.png' },
        { from: 'edge', to: 'origin', label: 'miss', tone: 'warn', phase: 1 },
        { from: 'origin', to: 'edge', label: 'file', tone: 'ok', phase: 2 },
        { from: 'edge', to: 'u1', label: 'file', tone: 'ok', phase: 3 },
      ],
      after: { edge: { sub: 'logo.png ✓', tone: 'active' } },
    },
    {
      caption: 'The edge keeps a copy, as long as the Cache-Control header allows. The next user is served in a few milliseconds without touching the origin.',
      packets: [
        { from: 'u2', to: 'edge', label: 'logo.png' },
        { from: 'edge', to: 'u2', label: 'hit', tone: 'ok', phase: 1 },
      ],
      set: { edge: { tone: 'ok', sub: 'hit' } },
    },
    {
      caption: 'Deploying a new logo? Give the file a new, fingerprinted name (logo.3f9a.png) so caches can keep old files for a year without serving stale content.',
      set: { edge: { tone: 'active', sub: 'logo.3f9a.png' } },
    },
  ],
}

export default scene
