import type { Scene } from '../types'

const scene: Scene = {
  title: 'Optimistic updates, with a rollback',
  height: 230,
  nodes: [
    { id: 'ui', x: 70, y: 115, w: 120, h: 50, label: 'Screen', sub: '♡ 12 likes' },
    { id: 'pending', x: 210, y: 40, w: 110, h: 40, label: 'Pending queue', sub: 'empty' },
    { id: 'srv', x: 350, y: 115, w: 96, h: 46, label: 'Server', sub: '12' },
  ],
  edges: [
    { from: 'ui', to: 'pending', dashed: true },
    { from: 'ui', to: 'srv' },
  ],
  steps: [
    { caption: 'Waiting for the server on every tap makes an app feel as slow as the worst network. Optimistic UI shows the result first.' },
    {
      caption: 'Tap like: the screen updates instantly to 13, and the action is queued with an idempotency key.',
      set: { ui: { sub: '♥ 13 likes', tone: 'active' }, pending: { sub: 'like #a1' } },
    },
    {
      caption: 'The request goes to the server in the background. It succeeds, so nothing visible changes.',
      packets: [
        { from: 'ui', to: 'srv', label: 'like #a1' },
        { from: 'srv', to: 'ui', label: 'ok', tone: 'ok', phase: 1 },
      ],
      after: { srv: { sub: '13' }, pending: { sub: 'empty' }, ui: { tone: 'neutral' } },
    },
    {
      caption: 'Next, the user saves a comment while their connection is flaky. It appears right away, marked as sending.',
      set: { ui: { sub: 'comment (sending…)', tone: 'active' }, pending: { sub: 'comment #b2' } },
      packets: [{ from: 'ui', to: 'srv', label: 'comment', tone: 'warn' }],
    },
    {
      caption: 'The server rejects it (the post was deleted). The UI rolls back and says so clearly, instead of pretending it worked.',
      packets: [{ from: 'srv', to: 'ui', label: 'rejected', tone: 'error' }],
      after: { ui: { sub: 'Couldn’t post comment', tone: 'error' }, pending: { sub: 'empty' } },
    },
    {
      caption: 'Use optimism for actions that almost always succeed and are easy to undo. Payments and bookings should wait for the server.',
      set: { ui: { tone: 'neutral', sub: '♥ 13 likes' } },
    },
  ],
}

export default scene
