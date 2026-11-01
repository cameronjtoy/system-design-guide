import type { Scene } from '../types'

const scene: Scene = {
  title: 'Cells limit the blast radius',
  height: 250,
  nodes: [
    { id: 'router', x: 210, y: 40, w: 130, h: 46, label: 'Cell router', sub: 'customer → cell' },
    { id: 'c1', x: 70, y: 175, w: 104, h: 80, label: 'Cell 1', sub: 'customers A–F' },
    { id: 'c2', x: 210, y: 175, w: 104, h: 80, label: 'Cell 2', sub: 'customers G–P' },
    { id: 'c3', x: 350, y: 175, w: 104, h: 80, label: 'Cell 3', sub: 'customers Q–Z' },
  ],
  edges: [
    { from: 'router', to: 'c1' },
    { from: 'router', to: 'c2' },
    { from: 'router', to: 'c3' },
  ],
  steps: [
    { caption: 'Instead of one big deployment, the service runs as several complete, independent copies called cells. Each serves a fixed slice of customers.' },
    {
      caption: 'A thin router sends each customer to their cell. Cells share nothing: their own servers, databases and queues.',
      packets: [
        { from: 'router', to: 'c1', label: 'Bea' },
        { from: 'router', to: 'c2', label: 'Kai' },
        { from: 'router', to: 'c3', label: 'Tom' },
      ],
    },
    {
      caption: 'A bad deploy goes to cell 1 first. It breaks…',
      set: { c1: { tone: 'error', sub: 'bad deploy!' } },
    },
    {
      caption: '…but only customers A–F are affected. Cells 2 and 3 keep serving normally, so a third of customers are hit instead of everyone.',
      set: { c2: { tone: 'ok' }, c3: { tone: 'ok' } },
      packets: [
        { from: 'router', to: 'c2', label: 'Kai' },
        { from: 'router', to: 'c3', label: 'Tom' },
      ],
    },
    {
      caption: 'The deploy is rolled back in cell 1 before it ever reaches the others. More cells means a smaller blast radius per failure.',
      set: { c1: { tone: 'neutral', sub: 'rolled back' }, c2: { tone: 'neutral' }, c3: { tone: 'neutral' } },
    },
  ],
}

export default scene
