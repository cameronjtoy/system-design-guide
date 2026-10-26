import type { QuizBank } from './types.ts'

const quizzes: QuizBank = {
  'caching-strategies': [
    {
      type: 'choice',
      q: 'In the cache-aside pattern, who loads data into the cache on a miss?',
      options: [
        'The application: it reads the database and then writes the result to the cache',
        'The database pushes changes automatically',
        'The CDN',
        'Nobody; the cache is filled at deploy time',
      ],
      answer: 0,
      explain: 'Cache-aside (lazy loading) is the most common pattern: check the cache, on a miss read the source and populate the cache.',
    },
    {
      type: 'choice',
      q: 'Which strategy writes to the cache and the database at the same time, keeping the cache fresh at the cost of slower writes?',
      options: ['Write-through', 'Write-behind', 'Cache-aside', 'Refresh-ahead'],
      answer: 0,
      explain: 'Write-through updates both synchronously. Write-behind acknowledges after the cache write and flushes later, which is faster but risks losing data.',
    },
    {
      type: 'choice',
      q: 'What is the main risk of write-behind (write-back) caching?',
      options: [
        'Data acknowledged to the user can be lost if the cache fails before flushing',
        'Reads become slower',
        'It cannot be used with Redis',
        'It increases database writes',
      ],
      answer: 0,
      explain: 'The database lags behind the cache, so a cache crash can lose recent writes unless the cache is durable.',
    },
    {
      type: 'number',
      q: 'A cache hit takes 1 ms and a miss (cache check + database) takes 21 ms. With a 90% hit rate, what is the average latency?',
      answer: 3,
      unit: 'ms',
      tolerance: 0.1,
      explain: '0.9 × 1 + 0.1 × 21 = 0.9 + 2.1 = 3 ms. Raising the hit rate to 99% would bring it to 1.2 ms.',
    },
  ],
  'cache-invalidation': [
    {
      type: 'choice',
      q: 'Why is deleting the cache entry on update usually safer than overwriting it with the new value?',
      options: [
        'Concurrent writers can race and leave an older value in the cache if they overwrite',
        'Deleting is faster on every cache',
        'Overwriting is not supported by Redis',
        'Deleting keeps the hit rate at 100%',
      ],
      answer: 0,
      explain: 'Two updates can write the cache in the opposite order from the database. Deleting lets the next read load the current value (races are still possible, but rarer).',
    },
    {
      type: 'choice',
      q: 'What does a TTL (time to live) on cache entries guarantee?',
      options: [
        'A bound on how stale an entry can be, even if an invalidation is missed',
        'That entries are always fresh',
        'That the cache never evicts entries',
        'That writes are durable',
      ],
      answer: 0,
      explain: 'TTLs are a safety net: if an invalidation message is lost, the entry still expires eventually.',
    },
    {
      type: 'choice',
      q: 'Which approach invalidates caches reliably when many services cache the same data?',
      options: [
        'Publish change events (for example via change data capture) that every cache consumer acts on',
        'Ask each team to remember to clear their cache',
        'Restart all services nightly',
        'Never cache shared data',
      ],
      answer: 0,
      explain: 'Driving invalidation from the database’s change stream means no code path can forget to send it.',
    },
  ],
  'cache-eviction-policies': [
    {
      type: 'choice',
      q: 'Which eviction policy removes the item that hasn’t been accessed for the longest time?',
      options: ['LRU', 'LFU', 'FIFO', 'Random'],
      answer: 0,
      explain: 'Least Recently Used assumes recently used items will be used again soon. LFU evicts the least frequently used.',
    },
    {
      type: 'choice',
      q: 'A nightly batch job scans every item once and pushes all the popular items out of an LRU cache. What is this called?',
      options: ['Cache pollution from a scan', 'A cache stampede', 'Split brain', 'Write amplification'],
      answer: 0,
      explain: 'One-time scans flood LRU with items that won’t be reused. Scan-resistant policies (like segmented LRU or TinyLFU) admit new items more cautiously.',
    },
    {
      type: 'choice',
      q: 'When is LFU better than LRU?',
      options: [
        'When popularity is stable over time, so frequently used items should stay even if not touched recently',
        'When every item is accessed exactly once',
        'When the cache has unlimited memory',
        'Never',
      ],
      answer: 0,
      explain: 'LFU keeps long-term favorites. Its weakness is adapting slowly when popularity shifts, so many systems use aging or hybrid policies.',
    },
  ],
  'cache-stampede': [
    {
      type: 'choice',
      q: 'What is a cache stampede?',
      options: [
        'Many requests miss the same expired key at once and all hit the database together',
        'A cache that grows without limit',
        'Two caches with different data',
        'A slow network between cache nodes',
      ],
      answer: 0,
      explain: 'When a hot key expires, thousands of concurrent requests can try to rebuild it simultaneously and overload the source.',
    },
    {
      type: 'choice',
      q: 'Which technique lets only one request rebuild an expired entry while others wait or get the stale value?',
      options: ['Request coalescing (single flight) or a rebuild lock', 'Shorter TTLs', 'Bigger cache servers', 'Round-robin load balancing'],
      answer: 0,
      explain: 'Coalescing collapses concurrent misses for the same key into a single backend call.',
    },
    {
      type: 'choice',
      q: 'Why add random jitter to cache TTLs?',
      options: [
        'So many keys set at the same time don’t all expire at the same moment',
        'To make caching more secure',
        'To increase memory usage',
        'To make cache keys shorter',
      ],
      answer: 0,
      explain: 'Synchronized expiry causes synchronized misses. Jitter spreads them out. Probabilistic early refresh is another option.',
    },
  ],
  'multi-tier-caching': [
    {
      type: 'choice',
      q: 'Which order goes from closest to the user to farthest?',
      options: [
        'Browser cache → CDN edge → service cache → database',
        'Database → CDN → browser',
        'Service cache → browser → CDN',
        'CDN → database → browser',
      ],
      answer: 0,
      explain: 'Each tier is slower and more authoritative than the one before it, and each hit avoids all tiers behind it.',
    },
    {
      type: 'choice',
      q: 'What is the downside of an in-process (local memory) cache in each app server?',
      options: [
        'Each server has its own copy, so invalidation is harder and data may differ between servers',
        'It is slower than a network cache',
        'It cannot store strings',
        'It requires a CDN',
      ],
      answer: 0,
      explain: 'Local caches are the fastest tier but multiply copies. Keep TTLs short or broadcast invalidations.',
    },
    {
      type: 'number',
      q: 'The browser cache absorbs 50% of requests and the CDN serves 80% of what remains. What percentage of the original requests reach your servers?',
      answer: 10,
      unit: '%',
      tolerance: 0.05,
      explain: '50% pass the browser. The CDN serves 80% of those, so 20% of 50% = 10% reach the origin.',
    },
  ],
}

export default quizzes
