import type { Scene } from '../types'

const scene: Scene = {
  title: 'A load balancer spreading requests',
  height: 270,
  nodes: [
    { id: 'c1', x: 45, y: 60, w: 70, label: 'Client' },
    { id: 'c2', x: 45, y: 135, w: 70, label: 'Client' },
    { id: 'c3', x: 45, y: 210, w: 70, label: 'Client' },
    { id: 'lb', x: 190, y: 135, w: 104, h: 48, label: 'Load balancer' },
    { id: 'a', x: 350, y: 55, label: 'Server A', sub: '0 active' },
    { id: 'b', x: 350, y: 135, label: 'Server B', sub: '0 active' },
    { id: 'c', x: 350, y: 215, label: 'Server C', sub: '0 active' },
  ],
  edges: [
    { from: 'c1', to: 'lb' },
    { from: 'c2', to: 'lb' },
    { from: 'c3', to: 'lb' },
    { from: 'lb', to: 'a' },
    { from: 'lb', to: 'b' },
    { from: 'lb', to: 'c' },
  ],
  steps: [
    {
      caption: 'Clients only know one address: the load balancer. Behind it sit three identical, stateless servers.',
    },
    {
      caption: 'Round robin: the first request goes to server A…',
      packets: [
        { from: 'c1', to: 'lb', label: 'req 1' },
        { from: 'lb', to: 'a', label: 'req 1', phase: 1 },
      ],
      after: { a: { sub: '1 active', tone: 'active' } },
    },
    {
      caption: '…the second to server B…',
      packets: [
        { from: 'c2', to: 'lb', label: 'req 2' },
        { from: 'lb', to: 'b', label: 'req 2', phase: 1 },
      ],
      after: { b: { sub: '1 active', tone: 'active' } },
    },
    {
      caption: '…and the third to server C. Every server gets an equal share, whatever each request costs.',
      packets: [
        { from: 'c3', to: 'lb', label: 'req 3' },
        { from: 'lb', to: 'c', label: 'req 3', phase: 1 },
      ],
      after: { c: { sub: '1 active', tone: 'active' } },
    },
    {
      caption: 'Server B picks up some slow requests and gets busy. Round robin would keep sending it work anyway.',
      set: { b: { sub: '4 active', tone: 'warn' }, a: { sub: '1 active' } },
    },
    {
      caption: 'Least connections (or “power of two choices”) sends the next request to the server with the fewest requests in flight: C, not B.',
      packets: [
        { from: 'c1', to: 'lb', label: 'req 4' },
        { from: 'lb', to: 'c', label: 'req 4', phase: 1 },
      ],
      after: { c: { sub: '2 active' } },
    },
    {
      caption: 'Server A crashes. Its health checks fail, so the load balancer takes it out of rotation.',
      set: { a: { tone: 'error', sub: 'down' } },
      edges: { 'lb>a': { cut: true, tone: 'error' } },
    },
    {
      caption: 'New requests flow only to healthy servers. Clients never notice, because no server held their state.',
      packets: [
        { from: 'c2', to: 'lb', label: 'req 5' },
        { from: 'c3', to: 'lb', label: 'req 6' },
        { from: 'lb', to: 'c', label: 'req 5', phase: 1 },
        { from: 'lb', to: 'b', label: 'req 6', phase: 1 },
      ],
      after: { c: { sub: '3 active' }, b: { sub: '5 active' } },
    },
  ],
}

export default scene
