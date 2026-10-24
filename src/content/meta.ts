// Shared by the app and the build-time content tooling, so keep it free of
// browser or Node specific imports.

export type CollectionId = 'principles' | 'postmortems' | 'case-studies' | 'practice'

export interface CollectionMeta {
  id: CollectionId
  label: string
  singular: string
  description: string
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    id: 'principles',
    label: 'Principles',
    singular: 'Principle',
    description: 'The building blocks of large systems, one idea per page.',
  },
  {
    id: 'postmortems',
    label: 'Postmortems',
    singular: 'Postmortem',
    description: 'Real outages, what caused them, and the principle each one teaches.',
  },
  {
    id: 'case-studies',
    label: 'Case studies',
    singular: 'Case study',
    description: 'How tech companies solved hard scaling problems in production.',
  },
  {
    id: 'practice',
    label: 'Practice problems',
    singular: 'Practice problem',
    description: 'Interview-style design problems with hints and a reference design.',
  },
]

export interface CategoryMeta {
  id: string
  label: string
  description: string
}

// Principle categories, in reading order. A principle's category is the name of
// the folder it lives in under src/content/principles/.
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Vocabulary and math every design discussion starts from.',
  },
  {
    id: 'scaling',
    label: 'Scaling & Traffic',
    description: 'Spreading load across machines and protecting them from too much of it.',
  },
  {
    id: 'data',
    label: 'Data & Storage',
    description: 'Where data lives, how it is split up, and how it survives failures.',
  },
  {
    id: 'caching',
    label: 'Caching',
    description: 'Serving answers faster than the source of truth can.',
  },
  {
    id: 'distributed',
    label: 'Distributed Systems',
    description: 'Agreeing on things when machines, networks and clocks fail.',
  },
  {
    id: 'messaging',
    label: 'Async & Messaging',
    description: 'Decoupling services in time with queues, logs and events.',
  },
  {
    id: 'reliability',
    label: 'Reliability & Ops',
    description: 'Limiting blast radius and recovering quickly when things break.',
  },
  {
    id: 'security',
    label: 'Security & APIs',
    description: 'Who can call what, and contracts that survive change.',
  },
  {
    id: 'ai-infra',
    label: 'AI Infrastructure',
    description: 'Serving, training and grounding large models in production.',
  },
]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export interface Source {
  title: string
  url: string
}

export interface Heading {
  depth: 2 | 3
  text: string
  id: string
}

interface BaseEntry {
  collection: CollectionId
  slug: string
  /** Path of the MDX file relative to the project root, e.g. /src/content/... */
  file: string
  title: string
  summary: string
  tags: string[]
  sources: Source[]
  headings: Heading[]
  readingMinutes: number
}

export interface PrincipleEntry extends BaseEntry {
  collection: 'principles'
  category: string
  difficulty: Difficulty
  order: number
  related: string[]
  companies: string[]
}

export interface PostmortemEntry extends BaseEntry {
  collection: 'postmortems'
  company: string
  /** YYYY-MM-DD */
  date: string
  duration?: string
  impact: string
  principles: string[]
}

export interface CaseStudyEntry extends BaseEntry {
  collection: 'case-studies'
  company: string
  year: number
  principles: string[]
}

export interface PracticeEntry extends BaseEntry {
  collection: 'practice'
  difficulty: Difficulty
  order: number
  principles: string[]
}

export type Entry = PrincipleEntry | PostmortemEntry | CaseStudyEntry | PracticeEntry

export interface SearchDoc {
  id: string
  collection: CollectionId
  slug: string
  title: string
  summary: string
  tags: string
  headings: string
  body: string
}
