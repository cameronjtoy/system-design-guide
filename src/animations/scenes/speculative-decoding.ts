import type { Item, Scene } from '../types'

const out = (accepted: string[], pending: string[] = [], rejected: string[] = []): Item[] => [
  ...accepted.map((l) => ({ label: l, tone: 'ok' as const })),
  ...pending.map((l) => ({ label: l, tone: 'active' as const })),
  ...rejected.map((l) => ({ label: l, tone: 'error' as const })),
]

const scene: Scene = {
  title: 'Speculative decoding: draft fast, verify in one pass',
  height: 240,
  nodes: [
    { id: 'draft', x: 80, y: 60, w: 120, h: 46, label: 'Small draft model', sub: 'fast' },
    { id: 'big', x: 80, y: 180, w: 120, h: 46, label: 'Large model', sub: 'slow, accurate' },
    { id: 'out', x: 300, y: 120, w: 200, h: 60, label: 'Output tokens', items: out(['The', 'cat']) },
  ],
  edges: [
    { from: 'draft', to: 'out' },
    { from: 'big', to: 'out' },
    { from: 'draft', to: 'big', dashed: true },
  ],
  steps: [
    { caption: 'Normally the large model generates one token per forward pass, and each pass is slow because it reads all of the model’s weights.' },
    {
      caption: 'A small draft model quickly guesses the next 4 tokens: “sat on the mat”.',
      packets: [{ from: 'draft', to: 'out', label: '4 guesses' }],
      after: { out: { items: out(['The', 'cat'], ['sat', 'on', 'the', 'mat']) } },
    },
    {
      caption: 'The large model checks all 4 guesses in a single pass, about the cost of generating one token.',
      packets: [{ from: 'big', to: 'out', label: 'verify all' }],
      set: { big: { tone: 'active' } },
    },
    {
      caption: 'It agrees with “sat on the” but would have chosen a different last word. Three tokens are accepted; “mat” is rejected.',
      set: { out: { items: out(['The', 'cat', 'sat', 'on', 'the'], [], ['mat']) }, big: { tone: 'neutral' } },
    },
    {
      caption: 'The large model’s own choice, “rug”, replaces it. Four tokens from one slow pass instead of one, and the output matches what the large model alone would produce.',
      set: { out: { items: out(['cat', 'sat', 'on', 'the', 'rug']) } },
    },
  ],
}

export default scene
