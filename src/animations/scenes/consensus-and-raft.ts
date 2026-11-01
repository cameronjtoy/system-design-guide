import type { Item, Scene } from '../types'

const log = (n: number, committed = n): Item[] =>
  Array.from({ length: n }, (_, i) => ({ label: String(i + 1), tone: i < committed ? 'ok' : 'active' }))

const scene: Scene = {
  title: 'Raft: electing a leader and committing to a majority',
  height: 280,
  nodes: [
    { id: 'n1', x: 210, y: 50, w: 104, h: 60, label: 'Node 1', sub: 'leader · term 1', tone: 'ok', items: log(2) },
    { id: 'n2', x: 75, y: 150, w: 104, h: 60, label: 'Node 2', sub: 'follower', items: log(2) },
    { id: 'n3', x: 345, y: 150, w: 104, h: 60, label: 'Node 3', sub: 'follower', items: log(2) },
    { id: 'n4', x: 130, y: 245, w: 104, h: 60, label: 'Node 4', sub: 'follower', items: log(2) },
    { id: 'n5', x: 290, y: 245, w: 104, h: 60, label: 'Node 5', sub: 'follower', items: log(2) },
  ],
  edges: [
    { from: 'n1', to: 'n2', dashed: true },
    { from: 'n1', to: 'n3', dashed: true },
    { from: 'n1', to: 'n4', dashed: true },
    { from: 'n1', to: 'n5', dashed: true },
    { from: 'n2', to: 'n3', dashed: true, hidden: true },
    { from: 'n2', to: 'n4', dashed: true, hidden: true },
    { from: 'n2', to: 'n5', dashed: true, hidden: true },
  ],
  steps: [
    { caption: 'Five nodes keep the same log. Node 1 is the leader; it sends heartbeats so followers know it’s alive.' },
    {
      caption: 'A client write arrives. The leader appends entry 3 to its log and sends it to every follower.',
      set: { n1: { items: log(3, 2) } },
      packets: [
        { from: 'n1', to: 'n2', label: '3' },
        { from: 'n1', to: 'n3', label: '3' },
        { from: 'n1', to: 'n4', label: '3' },
        { from: 'n1', to: 'n5', label: '3' },
      ],
      after: { n2: { items: log(3, 2) }, n3: { items: log(3, 2) }, n4: { items: log(3, 2) } },
    },
    {
      caption: 'Three followers acknowledge. With the leader that’s 4 of 5, a majority, so entry 3 is committed and applied.',
      packets: [
        { from: 'n2', to: 'n1', label: 'ack', tone: 'ok' },
        { from: 'n3', to: 'n1', label: 'ack', tone: 'ok' },
        { from: 'n4', to: 'n1', label: 'ack', tone: 'ok' },
      ],
      after: { n1: { items: log(3) }, n2: { items: log(3) }, n3: { items: log(3) }, n4: { items: log(3) } },
    },
    {
      caption: 'The leader crashes. Heartbeats stop.',
      set: { n1: { tone: 'error', sub: 'crashed' } },
      edges: { 'n1>n2': { hidden: true }, 'n1>n3': { hidden: true }, 'n1>n4': { hidden: true }, 'n1>n5': { hidden: true } },
    },
    {
      caption: 'Node 2’s randomized election timeout fires first. It becomes a candidate for term 2 and asks the others for votes.',
      set: { n2: { tone: 'warn', sub: 'candidate · term 2' } },
      edges: { 'n2>n3': { hidden: false }, 'n2>n4': { hidden: false }, 'n2>n5': { hidden: false } },
      packets: [
        { from: 'n2', to: 'n3', label: 'vote?' },
        { from: 'n2', to: 'n4', label: 'vote?' },
        { from: 'n2', to: 'n5', label: 'vote?' },
      ],
    },
    {
      caption: 'Nodes only vote for a candidate whose log is at least as up to date as theirs. Nodes 3 and 4 vote yes: with its own vote that’s 3 of 5.',
      packets: [
        { from: 'n3', to: 'n2', label: 'yes', tone: 'ok' },
        { from: 'n4', to: 'n2', label: 'yes', tone: 'ok' },
      ],
      after: { n2: { tone: 'ok', sub: 'leader · term 2' } },
    },
    {
      caption: 'Node 2 leads term 2 and brings node 5 up to date. Every committed entry survives, because any majority overlaps the one that stored it.',
      packets: [{ from: 'n2', to: 'n5', label: '3' }],
      after: { n5: { items: log(3) } },
    },
  ],
}

export default scene
