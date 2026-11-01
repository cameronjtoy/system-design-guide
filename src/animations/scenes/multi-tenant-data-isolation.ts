import type { Scene } from '../types'

const scene: Scene = {
  title: 'Tenant isolation in layers',
  height: 250,
  nodes: [
    { id: 'u', x: 55, y: 125, w: 86, h: 46, label: 'User', sub: 'org = Acme' },
    { id: 'api', x: 200, y: 125, w: 110, h: 50, label: 'API', sub: 'tenant from session' },
    { id: 'db', x: 355, y: 125, w: 110, h: 60, shape: 'cylinder', label: 'Postgres + RLS', sub: 'rows for every org' },
  ],
  edges: [
    { from: 'u', to: 'api' },
    { from: 'api', to: 'db' },
  ],
  steps: [
    { caption: 'Thousands of companies share one database. Every row has a tenant_id, and one missing filter could leak another company’s data.' },
    {
      caption: 'The API takes the tenant from the authenticated session, never from a parameter the client controls.',
      packets: [{ from: 'u', to: 'api', label: 'GET /projects' }],
      after: { api: { tone: 'active', sub: 'tenant = Acme' } },
    },
    {
      caption: 'It sets the tenant on the database connection. Row-level security policies then limit every query to Acme’s rows.',
      packets: [
        { from: 'api', to: 'db', label: 'SET tenant = Acme' },
        { from: 'db', to: 'api', label: 'Acme rows', tone: 'ok', phase: 1 },
      ],
      after: { db: { sub: 'policy: tenant = Acme', tone: 'active' } },
    },
    {
      caption: 'A buggy new endpoint forgets its WHERE tenant_id = … filter. Without RLS, it would return every company’s projects.',
      set: { api: { tone: 'warn', sub: 'filter missing!' } },
      packets: [{ from: 'api', to: 'db', label: 'SELECT * FROM projects', tone: 'warn' }],
    },
    {
      caption: 'With RLS, the database still only returns Acme’s rows. Defense in depth turns a data leak into a harmless bug.',
      packets: [{ from: 'db', to: 'api', label: 'Acme rows only', tone: 'ok' }],
      after: { api: { tone: 'active', sub: 'safe' } },
    },
    {
      caption: 'The same rule applies everywhere data lives: cache keys, search indexes, file paths and analytics exports all need the tenant in them.',
    },
  ],
}

export default scene
