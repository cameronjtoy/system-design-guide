import type { Scene } from '../types'

const scene: Scene = {
  title: 'CQRS: separate models for writing and reading',
  height: 240,
  nodes: [
    { id: 'u', x: 50, y: 120, w: 72, label: 'User' },
    { id: 'cmd', x: 175, y: 55, w: 104, h: 46, label: 'Write model', sub: 'rules + validation' },
    { id: 'wdb', x: 330, y: 55, w: 104, h: 50, shape: 'cylinder', label: 'Posts DB' },
    { id: 'proj', x: 330, y: 185, w: 104, h: 46, label: 'Projector', sub: 'builds timelines' },
    { id: 'read', x: 175, y: 185, w: 104, h: 50, shape: 'cylinder', label: 'Timeline cache', sub: 'ready to read' },
  ],
  edges: [
    { from: 'u', to: 'cmd' },
    { from: 'cmd', to: 'wdb' },
    { from: 'wdb', to: 'proj', dashed: true, label: 'events' },
    { from: 'proj', to: 'read' },
    { from: 'u', to: 'read' },
  ],
  steps: [
    { caption: 'Writes go through a model that enforces the rules. Reads come from a separate model shaped exactly for the screen that needs it.' },
    {
      caption: 'A user posts. The write model validates it and stores it in the posts database.',
      packets: [
        { from: 'u', to: 'cmd', label: 'new post' },
        { from: 'cmd', to: 'wdb', label: 'insert', phase: 1 },
      ],
    },
    {
      caption: 'A “post created” event flows to a projector, which updates each follower’s precomputed timeline.',
      packets: [
        { from: 'wdb', to: 'proj', label: 'event' },
        { from: 'proj', to: 'read', label: 'update', phase: 1 },
      ],
      after: { read: { tone: 'active' } },
    },
    {
      caption: 'Reading a timeline is now a single fast lookup, with no joins across tables.',
      packets: [
        { from: 'u', to: 'read', label: 'timeline?' },
        { from: 'read', to: 'u', label: 'timeline', tone: 'ok', phase: 1 },
      ],
    },
    {
      caption: 'The trade-off: the read model lags the write by a moment (eventual consistency), so apps often show the user’s own post optimistically.',
      set: { read: { tone: 'neutral' } },
    },
  ],
}

export default scene
