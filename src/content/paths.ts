// Learning paths shown at /paths. Each step is "<collection>/<slug>" and is
// validated by `npm run check:content`.

export interface PathSection {
  title: string
  steps: string[]
}

export interface LearningPath {
  slug: string
  title: string
  summary: string
  audience: string
  duration: string
  sections: PathSection[]
}

export function pathSteps(path: LearningPath): string[] {
  return path.sections.flatMap((s) => s.steps)
}

export const PATHS: LearningPath[] = [
  {
    slug: 'interview-prep-2-weeks',
    title: 'Interview prep in 2 weeks',
    summary:
      'The principles that come up most in system design interviews, one focused block per day, finishing with practice problems.',
    audience: 'Engineers preparing for system design interviews',
    duration: '14 days, about 1–2 hours a day',
    sections: [
      {
        title: 'Day 1: Thinking in numbers',
        steps: ['principles/latency-vs-throughput', 'principles/back-of-the-envelope-estimation', 'principles/availability-and-the-nines'],
      },
      {
        title: 'Day 2: Scaling the stateless tier',
        steps: ['principles/vertical-vs-horizontal-scaling', 'principles/stateless-services', 'principles/load-balancing'],
      },
      {
        title: 'Day 3: Caching',
        steps: ['principles/caching-strategies', 'principles/cache-invalidation', 'principles/cache-stampede', 'principles/cdn-and-edge-caching'],
      },
      {
        title: 'Day 4: Choosing and indexing a database',
        steps: ['principles/sql-vs-nosql', 'principles/database-indexing', 'principles/data-modeling-and-denormalization'],
      },
      {
        title: 'Day 5: Replication and sharding',
        steps: ['principles/replication', 'principles/sharding-and-partitioning', 'principles/consistent-hashing'],
      },
      {
        title: 'Day 6: Consistency',
        steps: ['principles/cap-theorem', 'principles/consistency-models', 'principles/quorums'],
      },
      {
        title: 'Day 7: Practice',
        steps: ['practice/design-url-shortener', 'case-studies/discord-trillions-of-messages'],
      },
      {
        title: 'Day 8: Async processing',
        steps: ['principles/message-queues-vs-logs', 'principles/pub-sub', 'principles/transactional-outbox'],
      },
      {
        title: 'Day 9: Correctness under retries',
        steps: ['principles/idempotency', 'principles/timeouts-retries-and-backoff', 'principles/distributed-transactions-and-sagas'],
      },
      {
        title: 'Day 10: Protecting the system',
        steps: ['principles/rate-limiting', 'principles/backpressure-and-load-shedding', 'principles/circuit-breakers'],
      },
      {
        title: 'Day 11: APIs and security',
        steps: ['principles/api-design-and-versioning', 'principles/pagination', 'principles/authentication-and-authorization'],
      },
      {
        title: 'Day 12: Practice',
        steps: ['practice/design-rate-limiter', 'practice/design-news-feed', 'case-studies/twitter-timelines'],
      },
      {
        title: 'Day 13: Real-time and reliability',
        steps: ['practice/design-chat-app', 'principles/graceful-degradation', 'principles/observability'],
      },
      {
        title: 'Day 14: Learn from failure',
        steps: ['postmortems/aws-s3-us-east-1-2017', 'postmortems/github-network-partition-2018', 'postmortems/cloudflare-waf-regex-2019'],
      },
    ],
  },
  {
    slug: 'fundamentals',
    title: 'Fundamentals first',
    summary: 'A gentle start for people new to system design: the vocabulary and building blocks, in order.',
    audience: 'Students and engineers new to system design',
    duration: 'About 1 week',
    sections: [
      {
        title: 'The language of system design',
        steps: ['principles/latency-vs-throughput', 'principles/availability-and-the-nines', 'principles/back-of-the-envelope-estimation'],
      },
      {
        title: 'Serving more users',
        steps: ['principles/vertical-vs-horizontal-scaling', 'principles/stateless-services', 'principles/load-balancing', 'principles/cdn-and-edge-caching'],
      },
      {
        title: 'Storing data',
        steps: ['principles/sql-vs-nosql', 'principles/database-indexing', 'principles/object-storage', 'principles/caching-strategies'],
      },
      {
        title: 'Your first design',
        steps: ['practice/design-url-shortener', 'case-studies/whatsapp-erlang'],
      },
    ],
  },
  {
    slug: 'reliability-engineering',
    title: 'Reliability engineering',
    summary: 'How large systems fail and how teams limit the damage, told through principles and real outages.',
    audience: 'Engineers on call for production systems',
    duration: 'About 2 weeks',
    sections: [
      {
        title: 'Measuring reliability',
        steps: ['principles/slis-slos-and-error-budgets', 'principles/observability', 'principles/tail-latency'],
      },
      {
        title: 'Surviving dependency failures',
        steps: ['principles/timeouts-retries-and-backoff', 'principles/circuit-breakers', 'principles/graceful-degradation', 'postmortems/aws-dynamodb-us-east-1-2015'],
      },
      {
        title: 'Limiting blast radius',
        steps: ['principles/bulkheads', 'principles/cell-based-architecture', 'case-studies/shopify-pods', 'case-studies/aws-shuffle-sharding', 'postmortems/aws-kinesis-us-east-1-2020'],
      },
      {
        title: 'Changing systems safely',
        steps: ['principles/progressive-delivery', 'postmortems/crowdstrike-channel-file-291-2024', 'postmortems/google-cloud-service-control-2025', 'postmortems/knight-capital-2012'],
      },
      {
        title: 'Recovering from the worst day',
        steps: ['principles/static-stability', 'principles/backups-and-disaster-recovery', 'principles/chaos-engineering', 'postmortems/facebook-bgp-dns-2021', 'postmortems/gitlab-database-deletion-2017'],
      },
    ],
  },
  {
    slug: 'data-at-scale',
    title: 'Data at scale',
    summary: 'Storage engines, replication, partitioning and consistency, with the companies that pushed each to its limits.',
    audience: 'Backend and data engineers',
    duration: 'About 2 weeks',
    sections: [
      {
        title: 'Storage foundations',
        steps: ['principles/sql-vs-nosql', 'principles/lsm-trees-vs-b-trees', 'principles/database-indexing', 'principles/transactions-and-isolation-levels'],
      },
      {
        title: 'Copies and agreement',
        steps: ['principles/replication', 'principles/consistency-models', 'principles/quorums', 'principles/consensus-and-raft', 'principles/split-brain-and-fencing'],
      },
      {
        title: 'Splitting data',
        steps: ['principles/sharding-and-partitioning', 'principles/consistent-hashing', 'case-studies/notion-sharding-postgres', 'case-studies/slack-vitess'],
      },
      {
        title: 'Data in motion',
        steps: ['principles/message-queues-vs-logs', 'principles/event-sourcing', 'principles/cqrs', 'principles/stream-processing', 'case-studies/linkedin-kafka-and-the-log'],
      },
      {
        title: 'Global scale',
        steps: ['principles/pacelc', 'principles/clocks-and-ordering', 'case-studies/google-spanner-truetime', 'case-studies/discord-trillions-of-messages'],
      },
    ],
  },
  {
    slug: 'ai-infrastructure',
    title: 'AI infrastructure track',
    summary: 'How large models are served, trained and built into products, from GPU memory to agents.',
    audience: 'Engineers building with or operating large language models',
    duration: 'About 2 weeks',
    sections: [
      {
        title: 'How inference works',
        steps: ['principles/llm-inference-basics', 'principles/kv-cache-and-paged-attention', 'principles/continuous-batching', 'case-studies/vllm-pagedattention'],
      },
      {
        title: 'Making serving cheaper and faster',
        steps: ['principles/speculative-decoding', 'principles/quantization-and-distillation', 'principles/gpu-scheduling-and-multi-tenancy', 'principles/semantic-caching-and-model-routing'],
      },
      {
        title: 'Training at scale',
        steps: ['principles/distributed-training-parallelism', 'principles/training-fault-tolerance-and-checkpointing', 'case-studies/meta-llama-3-training'],
      },
      {
        title: 'Building products on models',
        steps: ['principles/rag-architecture', 'principles/vector-search', 'case-studies/youtube-deep-recommendations', 'principles/agent-systems', 'principles/llm-evals-and-guardrails'],
      },
      {
        title: 'Put it together',
        steps: ['practice/design-llm-serving-platform', 'practice/design-rag-assistant', 'case-studies/uber-michelangelo'],
      },
    ],
  },
]
