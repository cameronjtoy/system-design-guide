import type { Scene } from '../types'

const scene: Scene = {
  title: 'Retrieval-augmented generation, step by step',
  height: 270,
  nodes: [
    { id: 'u', x: 50, y: 135, w: 72, label: 'User' },
    { id: 'app', x: 160, y: 135, w: 86, h: 46, label: 'RAG app', sub: '' },
    { id: 'emb', x: 160, y: 40, w: 100, h: 40, label: 'Embed query' },
    { id: 'vec', x: 330, y: 40, w: 120, h: 50, shape: 'cylinder', label: 'Vector + keyword', sub: 'filtered by ACL' },
    { id: 'rr', x: 330, y: 135, w: 110, h: 42, label: 'Reranker' },
    { id: 'llm', x: 330, y: 230, w: 110, h: 46, label: 'LLM', sub: 'answer + cite' },
  ],
  edges: [
    { from: 'u', to: 'app' },
    { from: 'app', to: 'emb' },
    { from: 'emb', to: 'vec' },
    { from: 'vec', to: 'rr' },
    { from: 'rr', to: 'app' },
    { from: 'app', to: 'llm' },
  ],
  steps: [
    { caption: 'An employee asks, “What is our parental leave policy in Germany?” The model was never trained on your internal documents.' },
    {
      caption: 'The question is turned into an embedding (a vector of numbers capturing its meaning).',
      packets: [
        { from: 'u', to: 'app', label: 'question' },
        { from: 'app', to: 'emb', phase: 1 },
      ],
    },
    {
      caption: 'Hybrid search finds the most similar chunks, filtered to documents this user is allowed to see. Permissions are enforced here, not in the prompt.',
      packets: [{ from: 'emb', to: 'vec', label: 'vector' }],
      after: { vec: { tone: 'active' } },
    },
    {
      caption: 'A reranker picks the best few chunks out of the top 50 candidates.',
      packets: [
        { from: 'vec', to: 'rr', label: '50 chunks' },
        { from: 'rr', to: 'app', label: 'best 5', tone: 'ok', phase: 1 },
      ],
      set: { vec: { tone: 'neutral' } },
    },
    {
      caption: 'The app sends the question plus those chunks to the LLM, instructing it to answer only from them and cite its sources.',
      packets: [{ from: 'app', to: 'llm', label: 'question + 5 chunks' }],
      after: { llm: { tone: 'active' } },
    },
    {
      caption: 'The grounded answer streams back with links to the policy pages. If nothing relevant was found, it should say “I don’t know.”',
      packets: [
        { from: 'llm', to: 'app', label: 'answer [1][2]', tone: 'ok' },
        { from: 'app', to: 'u', label: 'answer', tone: 'ok', phase: 1 },
      ],
      set: { llm: { tone: 'neutral' } },
    },
  ],
}

export default scene
