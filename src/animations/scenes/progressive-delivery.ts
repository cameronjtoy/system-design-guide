import type { Scene } from '../types'

const scene: Scene = {
  title: 'A canary release with automatic rollback',
  height: 240,
  nodes: [
    { id: 'lb', x: 70, y: 120, w: 100, h: 46, label: 'Traffic', sub: '100%' },
    { id: 'stable', x: 330, y: 60, w: 130, h: 50, label: 'Stable v41', sub: '100% of traffic', tone: 'ok' },
    { id: 'canary', x: 330, y: 180, w: 130, h: 50, label: 'Canary v42', sub: 'not deployed', tone: 'muted' },
  ],
  edges: [
    { from: 'lb', to: 'stable' },
    { from: 'lb', to: 'canary', hidden: true },
  ],
  steps: [
    { caption: 'Instead of replacing every server at once, deploy the new version to a small slice and compare it against the old one.' },
    {
      caption: 'v42 receives 1% of traffic. The pipeline compares its error rate and latency with v41’s.',
      set: { canary: { tone: 'active', sub: '1% of traffic' }, stable: { sub: '99% of traffic' } },
      edges: { 'lb>canary': { hidden: false } },
      packets: [
        { from: 'lb', to: 'stable' },
        { from: 'lb', to: 'stable', phase: 1 },
        { from: 'lb', to: 'canary' },
      ],
    },
    {
      caption: 'The canary’s errors are double the baseline’s. The pipeline halts the rollout automatically…',
      set: { canary: { tone: 'error', sub: '1% · errors 2×' } },
    },
    {
      caption: '…and rolls back. Only 1% of requests saw the bug, for a few minutes.',
      set: { canary: { tone: 'muted', sub: 'rolled back' }, stable: { sub: '100% of traffic' } },
      edges: { 'lb>canary': { hidden: true } },
    },
    {
      caption: 'A fixed v43 passes each stage (1%, 10%, 50%, 100%) while metrics stay healthy. Configuration and content changes deserve the same treatment: CrowdStrike’s 2024 outage came from an update pushed everywhere at once.',
      set: { canary: { tone: 'ok', label: 'v43', sub: '100% of traffic' }, stable: { tone: 'muted', sub: 'retired' } },
      edges: { 'lb>canary': { hidden: false } },
      packets: [{ from: 'lb', to: 'canary', tone: 'ok' }],
    },
  ],
}

export default scene
