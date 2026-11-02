import type { ScenarioQuestion } from './types.ts'

// "Which concept is this?" questions for Quick practice. Append new questions
// at the end: a question's position is its id for saved results.
const s = (q: string, answer: string, distractors: string[], explain: string): ScenarioQuestion => ({
  q,
  answer,
  distractors,
  explain,
})

export const SCENARIOS: ScenarioQuestion[] = [
  // Foundations
  s(
    'Your p50 latency is 40 ms, but heavy users complain the app is slow. A page calls 60 backends and waits for all of them.',
    'tail-latency',
    ['latency-vs-throughput', 'cap-theorem', 'back-of-the-envelope-estimation'],
    'With wide fan-out, the slowest backend decides the page’s latency, so rare slow responses become common. Look at p99 and consider hedged requests.',
  ),
  s(
    'Before choosing a database, you work out that 20M users posting twice a day at 2 KB each means about 30 TB a year.',
    'back-of-the-envelope-estimation',
    ['sharding-and-partitioning', 'object-storage', 'slis-slos-and-error-budgets'],
    'Rough numbers decide the architecture: whether one database is enough or you need partitioning from the start.',
  ),
  s(
    'Two data centers lose their link. The team must decide whether each side keeps accepting orders or refuses until the link is back.',
    'cap-theorem',
    ['pacelc', 'split-brain-and-fencing', 'replication'],
    'During a partition you choose consistency (refuse some requests) or availability (accept them and reconcile later).',
  ),
  s(
    'Even with a healthy network, every write to your global database waits for replicas on three continents, adding 150 ms.',
    'pacelc',
    ['cap-theorem', 'tail-latency', 'quorums'],
    'PACELC: Else (no partition), choose Latency or Consistency. Strong cross-region consistency costs latency even when nothing is broken.',
  ),
  s(
    'Your team has burned the month’s reliability allowance by the 12th, so feature launches pause and the next sprint goes to stability work.',
    'slis-slos-and-error-budgets',
    ['availability-and-the-nines', 'progressive-delivery', 'observability'],
    'An error budget policy trades release speed against reliability: once the budget is spent, risky changes slow down.',
  ),
  s(
    'A user edits their bio, refreshes and sees the old one. A second refresh shows the new bio.',
    'consistency-models',
    ['cache-stampede', 'clocks-and-ordering', 'idempotency'],
    'This is a read-your-writes violation, typically caused by reading from a lagging replica. Consistency models describe which guarantees users get.',
  ),
  s(
    'A batch pipeline processes 2 million records a minute, but each record takes 3 seconds from arrival to completion.',
    'latency-vs-throughput',
    ['tail-latency', 'stream-processing', 'autoscaling'],
    'High throughput and high latency at once: they measure different things, and batching often raises one at the cost of the other.',
  ),
  s(
    'A service depends on four others in series, each 99.9% available, and the team is surprised it only manages about 99.6%.',
    'availability-and-the-nines',
    ['slis-slos-and-error-budgets', 'bulkheads', 'tail-latency'],
    'Serial dependencies multiply availabilities: 0.999⁴ ≈ 99.6%. Each extra hard dependency lowers the ceiling.',
  ),

  // Scaling
  s(
    'Users get logged out randomly after you add a second web server behind the load balancer.',
    'stateless-services',
    ['load-balancing', 'authentication-and-authorization', 'cache-invalidation'],
    'Sessions were stored in server memory. Move state to a shared store or a signed token so any server can handle any request.',
  ),
  s(
    'One server is stuck on slow requests while the others sit idle, because traffic is sent to each server in turn.',
    'load-balancing',
    ['autoscaling', 'backpressure-and-load-shedding', 'bulkheads'],
    'Round robin ignores load. Least-outstanding-requests or power-of-two-choices balancing sends work to less busy servers.',
  ),
  s(
    'A single customer’s script sends 5,000 requests a second and slows the API for everyone else.',
    'rate-limiting',
    ['backpressure-and-load-shedding', 'circuit-breakers', 'cdn-and-edge-caching'],
    'Per-client limits (for example a token bucket per API key) keep one client from taking more than its share.',
  ),
  s(
    'During a flash sale, total traffic is 3× capacity even though no single client is over its limit. You start rejecting low-priority requests with 503s.',
    'backpressure-and-load-shedding',
    ['rate-limiting', 'autoscaling', 'graceful-degradation'],
    'Load shedding protects total capacity, which per-client rate limits can’t. Accepted requests stay fast instead of everything timing out.',
  ),
  s(
    'Images for users in Australia load in 900 ms from your Virginia servers. After a change they load in 60 ms and your servers see far fewer requests.',
    'cdn-and-edge-caching',
    ['multi-tier-caching', 'object-storage', 'load-balancing'],
    'A CDN caches content at edge locations near users, cutting latency and origin load.',
  ),
  s(
    'Your queue workers add instances when the backlog grows and remove them overnight, but a sudden spike still causes delays because new instances take 4 minutes to boot.',
    'autoscaling',
    ['backpressure-and-load-shedding', 'static-stability', 'stateless-services'],
    'Autoscaling reacts after the fact. Keep headroom, scale ahead of known peaks, and scale on queue depth rather than CPU.',
  ),
  s(
    'Every microservice reimplements authentication and request logging. You move these into one layer in front of all services.',
    'api-gateways',
    ['zero-trust-networking', 'service-discovery', 'load-balancing'],
    'A gateway handles cross-cutting edge concerns (auth, rate limits, routing) so services don’t each repeat them.',
  ),
  s(
    'Your database server is already the largest instance the cloud offers, and writes are still growing 10% a month.',
    'vertical-vs-horizontal-scaling',
    ['autoscaling', 'database-indexing', 'cdn-and-edge-caching'],
    'Vertical scaling has a ceiling. The next step is spreading load across machines: replicas for reads, partitioning for writes.',
  ),

  // Caching
  s(
    'Product pages read the same item details thousands of times a second. You check Redis first and only query Postgres on a miss.',
    'caching-strategies',
    ['multi-tier-caching', 'cdn-and-edge-caching', 'data-modeling-and-denormalization'],
    'That is cache-aside: the application loads data into the cache on a miss.',
  ),
  s(
    'After a price change, some users still see the old price for 10 minutes because the cached copy wasn’t updated.',
    'cache-invalidation',
    ['cache-eviction-policies', 'consistency-models', 'replication'],
    'Delete or update cached entries when the source changes, and keep TTLs as a safety net for missed invalidations.',
  ),
  s(
    'The home feed key expires and thousands of requests hit the database at the same instant, which falls over.',
    'cache-stampede',
    ['cache-invalidation', 'backpressure-and-load-shedding', 'cache-eviction-policies'],
    'Coalesce concurrent misses so only one request rebuilds the key, serve stale while refreshing, and add TTL jitter.',
  ),
  s(
    'A weekly report scans every product once and pushes the popular items out of the cache, so hit rate drops for hours.',
    'cache-eviction-policies',
    ['cache-stampede', 'cache-invalidation', 'caching-strategies'],
    'Plain LRU is polluted by one-time scans. Scan-resistant policies admit new items more carefully.',
  ),
  s(
    'Requests are answered from the browser if possible, then a CDN, then an in-memory cache, and only then the database.',
    'multi-tier-caching',
    ['cdn-and-edge-caching', 'caching-strategies', 'static-stability'],
    'Each tier is slower but more authoritative than the one before; a hit at any tier skips all those behind it.',
  ),

  // Data
  s(
    'Reads are slow on a 200M-row orders table. Adding an index on (customer_id, created_at) makes them fast, but inserts get slightly slower.',
    'database-indexing',
    ['sharding-and-partitioning', 'lsm-trees-vs-b-trees', 'data-modeling-and-denormalization'],
    'Indexes speed up reads at the cost of extra work on every write.',
  ),
  s(
    'You store the author’s name on every comment so a feed needs no joins, and accept updating many rows when someone renames.',
    'data-modeling-and-denormalization',
    ['database-indexing', 'cqrs', 'sql-vs-nosql'],
    'Denormalization copies data to where it is read, moving cost from reads to writes.',
  ),
  s(
    'Adding a fourth cache server caused almost every key to move to a different server and the hit rate collapsed.',
    'consistent-hashing',
    ['sharding-and-partitioning', 'cache-eviction-policies', 'replication'],
    'hash(key) % N remaps most keys when N changes. Consistent hashing moves only about 1/N of them.',
  ),
  s(
    'One database can’t absorb the write rate, so you split customers across 16 databases by customer ID.',
    'sharding-and-partitioning',
    ['replication', 'consistent-hashing', 'vertical-vs-horizontal-scaling'],
    'Partitioning spreads data and writes across machines. Choose a key that spreads load and keeps most queries on one shard.',
  ),
  s(
    'After failover, the last few seconds of acknowledged writes are missing because the follower hadn’t received them yet.',
    'replication',
    ['backups-and-disaster-recovery', 'split-brain-and-fencing', 'exactly-once-delivery'],
    'Asynchronous replication acknowledges before followers confirm, so a failover can lose recent writes.',
  ),
  s(
    'Two support agents edit the same ticket balance at once and one change silently disappears.',
    'transactions-and-isolation-levels',
    ['idempotency', 'consistency-models', 'clocks-and-ordering'],
    'A lost update. Use atomic updates, row locks or a stricter isolation level.',
  ),
  s(
    'A write-heavy time-series workload works much better on a storage engine that buffers writes in memory and flushes sorted files.',
    'lsm-trees-vs-b-trees',
    ['database-indexing', 'object-storage', 'stream-processing'],
    'LSM trees turn random writes into sequential ones, at the cost of compaction and more work on reads.',
  ),
  s(
    'An engineer deletes production data by mistake. Replicas faithfully deleted it too, and the newest usable copy is a nightly snapshot.',
    'backups-and-disaster-recovery',
    ['replication', 'soft-deletes-audit-and-history', 'chaos-engineering'],
    'Replication copies mistakes. Point-in-time backups (and practiced restores) are what recover from them.',
  ),
  s(
    'Users upload 2 GB videos, which you store as whole files with a key per video rather than in database rows.',
    'object-storage',
    ['sql-vs-nosql', 'cdn-and-edge-caching', 'lsm-trees-vs-b-trees'],
    'Object storage is cheap, durable and scalable for large immutable blobs.',
  ),
  s(
    'A new app needs transactions, foreign keys and ad hoc reporting queries you haven’t designed yet.',
    'sql-vs-nosql',
    ['data-modeling-and-denormalization', 'operational-vs-analytical-data', 'database-indexing'],
    'A relational database is the usual default when correctness and flexible queries matter more than extreme scale.',
  ),

  // Distributed systems
  s(
    'A payment API times out, the client retries, and the customer is charged twice.',
    'idempotency',
    ['exactly-once-delivery', 'timeouts-retries-and-backoff', 'distributed-transactions-and-sagas'],
    'An idempotency key lets the server recognize a retry and return the original result instead of charging again.',
  ),
  s(
    'A consumer processes a message, crashes before committing its offset, and processes the same message again on restart.',
    'exactly-once-delivery',
    ['idempotency', 'message-queues-vs-logs', 'failure-detection-and-heartbeats'],
    'At-least-once delivery means duplicates happen. Exactly-once effects need idempotent processing or transactional offsets.',
  ),
  s(
    'Checkout reserves stock, charges the card, then fails to create the shipment, so you refund and release the stock.',
    'distributed-transactions-and-sagas',
    ['transactional-outbox', 'idempotency', 'transactions-and-isolation-levels'],
    'A saga runs local steps and undoes completed ones with compensating actions when a later step fails.',
  ),
  s(
    'A five-node cluster keeps working with two nodes down, but stops accepting writes when three are down.',
    'consensus-and-raft',
    ['quorums', 'leader-election', 'replication'],
    'Raft needs a majority (3 of 5) to elect a leader and commit entries.',
  ),
  s(
    'With 3 replicas, writes wait for 2 acknowledgements and reads ask 2 replicas, so every read sees the latest write.',
    'quorums',
    ['consensus-and-raft', 'replication', 'consistency-models'],
    'When R + W > N, read and write sets always overlap.',
  ),
  s(
    'A worker pauses for 30 seconds during garbage collection, loses its lock, wakes up and overwrites data written by the new lock holder.',
    'split-brain-and-fencing',
    ['leader-election', 'failure-detection-and-heartbeats', 'clocks-and-ordering'],
    'Fencing tokens let storage reject writes from a holder whose lease has been superseded.',
  ),
  s(
    'Only one instance of a scheduler should run jobs. Instances compete for a lease in etcd, and the holder renews it every few seconds.',
    'leader-election',
    ['consensus-and-raft', 'service-discovery', 'split-brain-and-fencing'],
    'Leases with expiry let a cluster pick one active leader and replace it automatically if it dies.',
  ),
  s(
    'Two writes on different servers carry timestamps that make the later one look earlier, and last-write-wins keeps the wrong value.',
    'clocks-and-ordering',
    ['consistency-models', 'quorums', 'transactions-and-isolation-levels'],
    'Wall clocks drift. Use logical clocks, server-assigned sequence numbers, or bounded-uncertainty clocks.',
  ),
  s(
    'A node is marked dead after missing heartbeats for 1 second during a brief network blip, triggering a needless failover.',
    'failure-detection-and-heartbeats',
    ['leader-election', 'timeouts-retries-and-backoff', 'circuit-breakers'],
    'Short timeouts detect failures fast but cause false alarms; tune them against how quickly you must react.',
  ),
  s(
    'Containers come and go every few minutes, and callers need the current addresses of healthy instances of the orders service.',
    'service-discovery',
    ['load-balancing', 'api-gateways', 'failure-detection-and-heartbeats'],
    'A registry or DNS tracks healthy instances so clients can find them as they change.',
  ),

  // Messaging
  s(
    'Billing, search and analytics all need to read every order event, at their own pace, and search wants to reprocess last week’s events.',
    'message-queues-vs-logs',
    ['pub-sub', 'event-sourcing', 'stream-processing'],
    'A log keeps events so independent consumer groups can read and replay them; a work queue deletes messages once handled.',
  ),
  s(
    'A new fraud team starts receiving OrderPlaced events without the orders team changing any code.',
    'pub-sub',
    ['message-queues-vs-logs', 'api-gateways', 'cqrs'],
    'Publishers don’t know their subscribers, so new ones can be added freely.',
  ),
  s(
    'Sometimes an order is saved but its event is never published, because the service crashed between the two steps.',
    'transactional-outbox',
    ['exactly-once-delivery', 'distributed-transactions-and-sagas', 'event-sourcing'],
    'Write the event into an outbox table in the same transaction as the order; a relay publishes it afterwards.',
  ),
  s(
    'Instead of storing an account’s balance, you store every deposit and withdrawal, and compute the balance from them.',
    'event-sourcing',
    ['soft-deletes-audit-and-history', 'cqrs', 'message-queues-vs-logs'],
    'The event log is the source of truth, and current state is derived by replaying it.',
  ),
  s(
    'Writes go through a model with all the validation rules, while reads come from precomputed views shaped for each screen.',
    'cqrs',
    ['event-sourcing', 'data-modeling-and-denormalization', 'caching-strategies'],
    'Command Query Responsibility Segregation separates the write model from read models.',
  ),
  s(
    'You count clicks per 5-minute window as they happen, handling events that arrive late from offline phones.',
    'stream-processing',
    ['message-queues-vs-logs', 'operational-vs-analytical-data', 'analytics-event-design'],
    'Stream processing computes results continuously, using event time, windows and watermarks.',
  ),

  // Reliability
  s(
    'The recommendations service is failing, and calls to it now fail immediately for 30 seconds instead of waiting for timeouts.',
    'circuit-breakers',
    ['bulkheads', 'timeouts-retries-and-backoff', 'graceful-degradation'],
    'An open breaker fails fast, protecting the caller and giving the dependency time to recover.',
  ),
  s(
    'A slow dependency uses up every worker thread, so unrelated requests like checkout fail too.',
    'bulkheads',
    ['circuit-breakers', 'backpressure-and-load-shedding', 'cell-based-architecture'],
    'Separate resource pools per dependency keep one slow dependency from exhausting everything.',
  ),
  s(
    'After an outage, thousands of clients retry at exactly the same moments and knock the service over again.',
    'timeouts-retries-and-backoff',
    ['rate-limiting', 'cache-stampede', 'circuit-breakers'],
    'Exponential backoff with jitter spreads retries out so a recovering service isn’t hit in synchronized waves.',
  ),
  s(
    'When the reviews service is down, product pages still load, just without the reviews section.',
    'graceful-degradation',
    ['circuit-breakers', 'designing-failure-states', 'static-stability'],
    'Optional features fail quietly so the core experience keeps working.',
  ),
  s(
    'Customers are split across 20 independent copies of the stack, so a bad deploy affects only 5% of them.',
    'cell-based-architecture',
    ['bulkheads', 'progressive-delivery', 'sharding-and-partitioning'],
    'Cells limit blast radius by isolating complete copies of the system per slice of customers.',
  ),
  s(
    'A new version gets 1% of traffic, its error rate is compared with the old version’s, and the rollout halts automatically when errors double.',
    'progressive-delivery',
    ['feature-flags-and-experimentation', 'cell-based-architecture', 'observability'],
    'Canary releases catch problems while they affect few users.',
  ),
  s(
    'Each availability zone runs enough capacity to absorb another zone’s traffic, so losing a zone needs no new instances.',
    'static-stability',
    ['autoscaling', 'cell-based-architecture', 'backups-and-disaster-recovery'],
    'A statically stable system keeps working without making changes during the failure, when control planes may be impaired.',
  ),
  s(
    'You deliberately terminate random production instances during business hours to prove services survive it.',
    'chaos-engineering',
    ['progressive-delivery', 'failure-detection-and-heartbeats', 'static-stability'],
    'Controlled failure injection finds weaknesses before real outages do.',
  ),
  s(
    'A request is slow, and a trace shows 900 ms of its 1 second was spent in one downstream call to the pricing service.',
    'observability',
    ['tail-latency', 'slis-slos-and-error-budgets', 'performance-as-a-feature'],
    'Traces, metrics and logs let you ask new questions about production behavior, like where one request spent its time.',
  ),

  // Security & APIs
  s(
    'Changing /orders/1001 to /orders/1002 in the URL shows another customer’s order.',
    'authentication-and-authorization',
    ['identifiers-and-keys', 'multi-tenant-data-isolation', 'zero-trust-networking'],
    'The user was authenticated but not authorized for that object. Check ownership on every access.',
  ),
  s(
    'Renaming a JSON field in your public API broke three partner integrations overnight.',
    'api-design-and-versioning',
    ['data-contracts-and-quality', 'zero-downtime-schema-migrations', 'reversible-decisions-and-mvp'],
    'Public APIs need backward-compatible changes: add fields, keep old ones, and version breaking changes.',
  ),
  s(
    'Page 5,000 of the activity feed takes 4 seconds, and users scrolling see some items twice.',
    'pagination',
    ['database-indexing', 'caching-strategies', 'data-modeling-and-denormalization'],
    'OFFSET pagination scans skipped rows and shifts as data changes. Cursor (keyset) pagination fixes both.',
  ),
  s(
    'A database password was found in a public Git repository, and rotating it means redeploying 30 services.',
    'secrets-and-config-management',
    ['zero-trust-networking', 'authentication-and-authorization', 'pii-privacy-and-retention'],
    'Keep secrets in a secrets manager, fetch them at runtime, and rotate them automatically.',
  ),
  s(
    'An attacker who got onto one internal server could call every other service, because internal traffic was trusted.',
    'zero-trust-networking',
    ['authentication-and-authorization', 'api-gateways', 'bulkheads'],
    'Zero trust authenticates and authorizes every request, regardless of network location.',
  ),

  // AI infrastructure
  s(
    'Your LLM endpoint’s GPUs sit half idle because short responses finish early while the batch waits for the longest one.',
    'continuous-batching',
    ['gpu-scheduling-and-multi-tenancy', 'kv-cache-and-paged-attention', 'speculative-decoding'],
    'Continuous batching adds and removes requests at every decoding step, keeping GPU slots full.',
  ),
  s(
    'You can’t fit more concurrent sequences on the GPU because each one reserves a large contiguous block of attention memory.',
    'kv-cache-and-paged-attention',
    ['quantization-and-distillation', 'continuous-batching', 'llm-inference-basics'],
    'PagedAttention allocates KV cache in small blocks on demand, cutting waste and allowing bigger batches.',
  ),
  s(
    'A small model guesses the next five tokens and the large model checks them all in one pass, speeding up generation.',
    'speculative-decoding',
    ['quantization-and-distillation', 'semantic-caching-and-model-routing', 'continuous-batching'],
    'Speculative decoding gets several tokens per large-model pass when the draft’s guesses are accepted.',
  ),
  s(
    'Storing a 70B model’s weights in 4 bits instead of 16 lets it fit on fewer GPUs with a small quality loss.',
    'quantization-and-distillation',
    ['kv-cache-and-paged-attention', 'distributed-training-parallelism', 'speculative-decoding'],
    'Quantization reduces memory and bandwidth per token. Always check quality on your evals.',
  ),
  s(
    'Easy customer questions go to a small, cheap model; only hard ones are sent to the largest model.',
    'semantic-caching-and-model-routing',
    ['agent-systems', 'gpu-scheduling-and-multi-tenancy', 'llm-evals-and-guardrails'],
    'Model routing cuts cost and latency by matching each request to the cheapest model that handles it well.',
  ),
  s(
    'One tenant’s huge batch job is slowing interactive chat for every other customer on the same GPUs.',
    'gpu-scheduling-and-multi-tenancy',
    ['rate-limiting', 'continuous-batching', 'bulkheads'],
    'Priority queues, token-based quotas and preemptible batch work keep interactive traffic fast.',
  ),
  s(
    'The assistant answers HR questions using your private policy documents, retrieved at query time and cited in the answer.',
    'rag-architecture',
    ['vector-search', 'agent-systems', 'llm-evals-and-guardrails'],
    'Retrieval-augmented generation grounds answers in documents the model wasn’t trained on.',
  ),
  s(
    'You need to find the 10 most similar embeddings among 200 million in under 20 ms, accepting that a few true neighbors are missed.',
    'vector-search',
    ['rag-architecture', 'database-indexing', 'semantic-caching-and-model-routing'],
    'Approximate nearest neighbor indexes like HNSW trade a little recall for huge speedups.',
  ),
  s(
    'A prompt change made answers friendlier but broke citation accuracy, which you only noticed when your fixed test set scored lower.',
    'llm-evals-and-guardrails',
    ['observability', 'feature-flags-and-experimentation', 'rag-architecture'],
    'Evals measure whether changes to prompts, models or retrieval help or hurt.',
  ),
  s(
    'An assistant reads a web page containing hidden instructions and tries to email internal files to an outside address.',
    'agent-systems',
    ['llm-evals-and-guardrails', 'zero-trust-networking', 'authentication-and-authorization'],
    'Agents that take actions need least-privilege tools, approval for risky actions, and must treat tool output as untrusted.',
  ),
  s(
    'A training run on 8,000 GPUs loses hours of progress whenever a single GPU fails.',
    'training-fault-tolerance-and-checkpointing',
    ['distributed-training-parallelism', 'backups-and-disaster-recovery', 'failure-detection-and-heartbeats'],
    'Frequent (ideally asynchronous) checkpoints and fast restarts limit lost work at large scale.',
  ),
  s(
    'A model is too large for one GPU’s memory, so each layer’s matrix multiplications are split across the 8 GPUs in a server.',
    'distributed-training-parallelism',
    ['quantization-and-distillation', 'gpu-scheduling-and-multi-tenancy', 'sharding-and-partitioning'],
    'Tensor parallelism splits individual layers across GPUs connected by fast links.',
  ),
  s(
    'Users see the first word of a chatbot answer after 2 seconds because the long prompt must be processed before any token is generated.',
    'llm-inference-basics',
    ['speculative-decoding', 'continuous-batching', 'tail-latency'],
    'Prefill processes the whole prompt before decoding starts, so long prompts raise time to first token.',
  ),

  // Product engineering
  s(
    'The spec says search must be “fast”. Engineering asks for “results in 300 ms at p95 on mid-range phones” instead.',
    'requirements-to-system-design',
    ['performance-as-a-feature', 'slis-slos-and-error-budgets', 'design-docs-and-decision-records'],
    'Turning adjectives into numbers is how product requirements become system design decisions.',
  ),
  s(
    'Every new feature adds an API call to the home screen, and nobody owns the total load time until it hits 4 seconds.',
    'performance-as-a-feature',
    ['tail-latency', 'observability', 'simplicity-and-technical-debt'],
    'A latency budget per key interaction makes performance a tracked product requirement.',
  ),
  s(
    'Tapping “like” updates the count instantly; if the server later rejects it, the count rolls back with a message.',
    'optimistic-ui-and-local-first',
    ['designing-failure-states', 'idempotency', 'performance-as-a-feature'],
    'Optimistic UI shows the expected result immediately and reconciles with the server in the background.',
  ),
  s(
    'A dashboard shows an infinite spinner when one of its five widgets’ services is down.',
    'designing-failure-states',
    ['graceful-degradation', 'optimistic-ui-and-local-first', 'circuit-breakers'],
    'Design loading, partial and error states up front so one failing dependency doesn’t break the screen.',
  ),
  s(
    'A new onboarding flow is shown to half of new users, chosen by user ID, and you compare activation rates after two full weeks.',
    'feature-flags-and-experimentation',
    ['progressive-delivery', 'product-metrics-and-instrumentation', 'reversible-decisions-and-mvp'],
    'An A/B experiment with a fixed duration and pre-chosen metrics measures whether the change helps.',
  ),
  s(
    'The team can’t tell whether a launch worked because nobody defined success or added tracking before shipping.',
    'product-metrics-and-instrumentation',
    ['analytics-event-design', 'observability', 'requirements-to-system-design'],
    'Decide the goal and metrics first (for example with HEART), then instrument what you need to compute them.',
  ),
  s(
    'The team debates UI colors for a week but picks the tenant ID scheme in five minutes.',
    'reversible-decisions-and-mvp',
    ['design-docs-and-decision-records', 'simplicity-and-technical-debt', 'identifiers-and-keys'],
    'Spend care on one-way doors (data model, IDs, public APIs) and move fast on reversible choices.',
  ),
  s(
    'A year later, nobody remembers why the team chose Kafka over SQS, so the debate starts again.',
    'design-docs-and-decision-records',
    ['reversible-decisions-and-mvp', 'requirements-to-system-design', 'simplicity-and-technical-debt'],
    'Design docs and decision records capture the alternatives and why one was chosen.',
  ),
  s(
    'A three-person startup runs 14 microservices on Kubernetes and spends most of its time on infrastructure.',
    'simplicity-and-technical-debt',
    ['vertical-vs-horizontal-scaling', 'reversible-decisions-and-mvp', 'stateless-services'],
    'Start with the simplest architecture that meets the requirements; spend novelty only where it differentiates the product.',
  ),

  // Data design & hygiene
  s(
    'A meeting booked for 9:00 in Berlin shows up at 8:00 after the country changes its daylight saving rules.',
    'data-types-time-and-money',
    ['clocks-and-ordering', 'constraints-and-validation', 'designing-data-for-applications'],
    'Store future local events as local time plus time zone, not only as UTC.',
  ),
  s(
    'Invoice totals are off by a cent because amounts were stored as floating-point numbers.',
    'data-types-time-and-money',
    ['constraints-and-validation', 'data-contracts-and-quality', 'transactions-and-isolation-levels'],
    'Store money as integer minor units with a currency code.',
  ),
  s(
    'Two simultaneous sign-ups created duplicate accounts with the same email, even though the code checks before inserting.',
    'constraints-and-validation',
    ['idempotency', 'transactions-and-isolation-levels', 'identifiers-and-keys'],
    'Check-then-insert races. A unique constraint in the database is the reliable guard.',
  ),
  s(
    'Renaming a column during a deploy crashed the old app servers that were still running.',
    'zero-downtime-schema-migrations',
    ['api-design-and-versioning', 'progressive-delivery', 'reversible-decisions-and-mvp'],
    'Expand and contract: add the new column, dual write, backfill, switch reads, then remove the old one.',
  ),
  s(
    'A customer deletes a project by accident and support can restore it for 30 days, after which it is purged.',
    'soft-deletes-audit-and-history',
    ['backups-and-disaster-recovery', 'pii-privacy-and-retention', 'event-sourcing'],
    'Recoverable deletion with a retention period turns mistakes into an undo.',
  ),
  s(
    'A new endpoint forgot its tenant filter, but the database still only returned the caller’s company’s rows.',
    'multi-tenant-data-isolation',
    ['authentication-and-authorization', 'constraints-and-validation', 'sharding-and-partitioning'],
    'Row-level security enforces tenant isolation as defense in depth behind application filters.',
  ),
  s(
    'Emails and phone numbers turned up in application logs that are kept for two years and copied to three vendors.',
    'pii-privacy-and-retention',
    ['secrets-and-config-management', 'soft-deletes-audit-and-history', 'observability'],
    'Minimize personal data, keep it out of logs, and set retention so it is deleted on schedule.',
  ),
  s(
    'The analytics tool has events named signup, Sign Up and user_signed_up_v2, and nobody trusts the funnel.',
    'analytics-event-design',
    ['data-contracts-and-quality', 'product-metrics-and-instrumentation', 'operational-vs-analytical-data'],
    'A consistent naming convention and tracking plan keep events usable.',
  ),
  s(
    'A producer team renamed a field and the revenue dashboard silently showed zero for two days.',
    'data-contracts-and-quality',
    ['api-design-and-versioning', 'analytics-event-design', 'observability'],
    'Data contracts, schema compatibility checks and volume monitoring catch breaking changes.',
  ),
  s(
    'A finance report running on the primary database slows down checkout every morning at 9:00.',
    'operational-vs-analytical-data',
    ['database-indexing', 'replication', 'backpressure-and-load-shedding'],
    'Move analytics to a warehouse fed by change data capture or events, away from the operational database.',
  ),
  s(
    'Public URLs like /invoices/48213 let competitors estimate how many invoices you issue each month.',
    'identifiers-and-keys',
    ['authentication-and-authorization', 'pii-privacy-and-retention', 'api-design-and-versioning'],
    'Sequential IDs leak volume and invite enumeration. Use random or time-ordered random IDs for public identifiers.',
  ),
  s(
    'Before building, the team lists entities, relationships and the top access patterns, and puts a workspace ID on every table.',
    'designing-data-for-applications',
    ['data-modeling-and-denormalization', 'requirements-to-system-design', 'sql-vs-nosql'],
    'Designing data starts from the domain and its queries, with tenant boundaries and ownership decided up front.',
  ),
]
