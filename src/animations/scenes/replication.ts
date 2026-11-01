import type { Scene } from '../types'

const scene: Scene = {
  title: 'Leader–follower replication and replication lag',
  height: 260,
  nodes: [
    { id: 'u', x: 55, y: 130, w: 80, label: 'User' },
    { id: 'l', x: 200, y: 60, w: 104, h: 52, shape: 'cylinder', label: 'Leader', sub: 'v1' },
    { id: 'f1', x: 360, y: 60, w: 92, h: 52, shape: 'cylinder', label: 'Follower', sub: 'v1' },
    { id: 'f2', x: 300, y: 200, w: 92, h: 52, shape: 'cylinder', label: 'Follower', sub: 'v1' },
  ],
  edges: [
    { from: 'u', to: 'l' },
    { from: 'u', to: 'f2', dashed: true },
    { from: 'l', to: 'f1' },
    { from: 'l', to: 'f2' },
  ],
  steps: [
    { caption: 'All writes go to the leader. Followers copy its changes and can serve reads, spreading the read load.' },
    {
      caption: 'The user updates their profile photo. The leader commits it and acknowledges right away (asynchronous replication).',
      packets: [
        { from: 'u', to: 'l', label: 'write v2' },
        { from: 'l', to: 'u', label: 'OK', tone: 'ok', phase: 1 },
      ],
      after: { l: { sub: 'v2', tone: 'active' } },
    },
    {
      caption: 'The change streams to the followers. One is quick, the other is lagging behind.',
      packets: [{ from: 'l', to: 'f1', label: 'v2' }],
      after: { f1: { sub: 'v2', tone: 'active' }, f2: { sub: 'v1 (lagging)', tone: 'warn' } },
    },
    {
      caption: 'The user reloads, and their read lands on the lagging follower: they see their OLD photo. That breaks read-your-writes.',
      packets: [
        { from: 'u', to: 'f2', label: 'read' },
        { from: 'f2', to: 'u', label: 'v1 ✗', tone: 'error', phase: 1 },
      ],
    },
    {
      caption: 'A common fix: for a short time after a user writes, send their reads to the leader (or a replica known to be caught up).',
      packets: [
        { from: 'u', to: 'l', label: 'read' },
        { from: 'l', to: 'u', label: 'v2 ✓', tone: 'ok', phase: 1 },
      ],
    },
    {
      caption: 'Eventually the slow follower catches up. If the leader had crashed before then, a failover to that follower would have lost v2.',
      packets: [{ from: 'l', to: 'f2', label: 'v2' }],
      after: { f2: { sub: 'v2', tone: 'active' } },
    },
  ],
}

export default scene
