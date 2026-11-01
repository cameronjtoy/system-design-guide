import type { Scene } from '../types'

const scene: Scene = {
  title: 'Rolling out behind a feature flag',
  height: 250,
  nodes: [
    { id: 'flag', x: 210, y: 40, w: 150, h: 46, label: 'Flag: new_checkout', sub: 'off' },
    { id: 'users', x: 60, y: 160, w: 90, h: 46, label: 'Users', sub: '100%' },
    { id: 'old', x: 350, y: 120, w: 110, h: 46, label: 'Old checkout', sub: '100%', tone: 'active' },
    { id: 'new', x: 350, y: 205, w: 110, h: 46, label: 'New checkout', sub: '0%' },
  ],
  edges: [
    { from: 'flag', to: 'users', dashed: true },
    { from: 'users', to: 'old' },
    { from: 'users', to: 'new' },
  ],
  steps: [
    { caption: 'The new checkout is already deployed, hidden behind a flag. Deploying code and releasing it to users are now separate steps.' },
    {
      caption: 'Turn it on for employees, then 5% of users, chosen by a stable hash of the user ID so each person always sees the same version.',
      set: { flag: { sub: '5%', tone: 'active' }, new: { sub: '5%', tone: 'active' }, old: { sub: '95%' } },
      packets: [
        { from: 'users', to: 'old' },
        { from: 'users', to: 'new' },
      ],
    },
    {
      caption: 'Watch the primary metric (completed checkouts) and guardrails (errors, latency, refunds). Errors spike in the new path…',
      set: { new: { tone: 'error', sub: '5% · errors ↑' } },
    },
    {
      caption: '…so flip the flag off. Everyone is back on the old checkout in seconds, with no rollback deploy.',
      set: { flag: { sub: 'off', tone: 'neutral' }, new: { tone: 'neutral', sub: '0%' }, old: { sub: '100%' } },
      packets: [{ from: 'users', to: 'old' }],
    },
    {
      caption: 'After a fix, ramp to 50% and run a proper A/B test with a sample size fixed in advance, then go to 100%.',
      set: { flag: { sub: '50%', tone: 'active' }, new: { sub: '50%', tone: 'ok' }, old: { sub: '50%' } },
    },
    {
      caption: 'Finally, delete the flag and the old code path. Stale flags are debt: Knight Capital lost $460M when a reused flag woke up dead code.',
      set: { flag: { sub: 'removed', tone: 'muted' }, new: { sub: '100%' }, old: { sub: 'deleted', tone: 'muted' } },
    },
  ],
}

export default scene
