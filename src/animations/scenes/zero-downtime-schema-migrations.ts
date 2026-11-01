import type { Scene } from '../types'

const scene: Scene = {
  title: 'Expand and contract: renaming a column with no downtime',
  height: 240,
  nodes: [
    { id: 'old', x: 75, y: 50, w: 110, h: 44, label: 'App v1', sub: 'uses name' },
    { id: 'new', x: 75, y: 130, w: 110, h: 44, label: 'App v2', sub: 'not deployed', tone: 'muted' },
    { id: 'name', x: 330, y: 50, w: 140, h: 44, label: 'column: name', sub: 'source of truth', tone: 'active' },
    { id: 'full', x: 330, y: 130, w: 140, h: 44, label: 'column: full_name', sub: 'doesn’t exist', hidden: true },
    { id: 'bf', x: 330, y: 210, w: 140, h: 40, label: 'Backfill job', hidden: true },
  ],
  edges: [
    { from: 'old', to: 'name' },
    { from: 'new', to: 'name', hidden: true },
    { from: 'new', to: 'full', hidden: true },
    { from: 'bf', to: 'full', hidden: true, dashed: true },
  ],
  steps: [
    { caption: 'Goal: rename users.name to full_name. During a deploy, old and new app versions run at the same time, so a one-step rename would break one of them.' },
    {
      caption: '1. Expand: add full_name as a new, nullable column. Old code ignores it, so nothing breaks.',
      set: { full: { hidden: false, sub: 'empty' } },
    },
    {
      caption: '2. Deploy v2, which writes to both columns and still reads name.',
      set: { new: { tone: 'neutral', sub: 'writes both' } },
      edges: { 'new>name': { hidden: false }, 'new>full': { hidden: false } },
      packets: [
        { from: 'new', to: 'name', label: 'write' },
        { from: 'new', to: 'full', label: 'write' },
      ],
    },
    {
      caption: '3. Backfill old rows in small batches, so the database isn’t overloaded. Then verify the two columns match.',
      set: { bf: { hidden: false } },
      edges: { 'bf>full': { hidden: false } },
      packets: [
        { from: 'bf', to: 'full', label: 'batch 1' },
        { from: 'bf', to: 'full', label: 'batch 2', phase: 1 },
      ],
      after: { full: { sub: 'filled ✓', tone: 'active' } },
    },
    {
      caption: '4. Switch reads to full_name. Once v1 is gone, stop writing name.',
      set: { old: { hidden: true }, new: { sub: 'reads full_name' }, name: { tone: 'muted', sub: 'unused' }, bf: { hidden: true } },
      edges: { 'new>name': { hidden: true }, 'bf>full': { hidden: true } },
    },
    {
      caption: '5. Contract: drop the old column. Every step was its own deploy, safe to pause or roll back.',
      set: { name: { hidden: true }, full: { tone: 'ok', sub: 'source of truth' } },
    },
  ],
}

export default scene
