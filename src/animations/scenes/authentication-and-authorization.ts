import type { Scene } from '../types'

const scene: Scene = {
  title: 'Log in once, then check permissions on every request',
  height: 250,
  nodes: [
    { id: 'u', x: 55, y: 125, w: 80, label: 'Browser' },
    { id: 'idp', x: 210, y: 45, w: 110, h: 46, label: 'Auth service', sub: 'who are you?' },
    { id: 'api', x: 210, y: 195, w: 110, h: 46, label: 'API', sub: 'may you?' },
    { id: 'db', x: 365, y: 195, w: 90, h: 52, shape: 'cylinder', label: 'Invoices', sub: 'owner check' },
  ],
  edges: [
    { from: 'u', to: 'idp' },
    { from: 'u', to: 'api' },
    { from: 'api', to: 'db' },
  ],
  steps: [
    { caption: 'Authentication proves who you are. Authorization decides what you may do. They are separate steps.' },
    {
      caption: 'Ana logs in with her password and a second factor. The auth service returns a short-lived signed token.',
      packets: [
        { from: 'u', to: 'idp', label: 'password + 2FA' },
        { from: 'idp', to: 'u', label: 'token (15 min)', tone: 'ok', phase: 1 },
      ],
      after: { u: { tone: 'active', sub: 'Ana' } },
    },
    {
      caption: 'She requests invoice 1001 with the token. The API verifies the signature, so it knows this is Ana.',
      packets: [{ from: 'u', to: 'api', label: 'GET /invoices/1001' }],
      after: { api: { tone: 'active', sub: 'token valid: Ana' } },
    },
    {
      caption: 'Authorization: the API checks Ana owns invoice 1001 (or is in its organization). She does, so the data comes back.',
      packets: [
        { from: 'api', to: 'db', label: 'owner = Ana?' },
        { from: 'db', to: 'api', label: 'yes', tone: 'ok', phase: 1 },
        { from: 'api', to: 'u', label: 'invoice', tone: 'ok', phase: 2 },
      ],
    },
    {
      caption: 'She edits the URL to /invoices/1002, someone else’s. Her token is still valid, so authentication passes…',
      packets: [{ from: 'u', to: 'api', label: 'GET /invoices/1002', tone: 'warn' }],
    },
    {
      caption: '…but the ownership check fails and the API returns 404. Skipping this check is the most common API vulnerability (broken object-level authorization).',
      packets: [
        { from: 'api', to: 'db', label: 'owner = Ana?' },
        { from: 'db', to: 'api', label: 'no', tone: 'error', phase: 1 },
        { from: 'api', to: 'u', label: '404', tone: 'error', phase: 2 },
      ],
    },
  ],
}

export default scene
