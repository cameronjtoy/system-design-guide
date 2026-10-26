import type { QuizBank } from './types.ts'

const quizzes: QuizBank = {
  'message-queues-vs-logs': [
    {
      type: 'choice',
      q: 'What is a key difference between a work queue (like SQS or RabbitMQ) and a log (like Kafka)?',
      options: [
        'A queue removes messages once acknowledged; a log keeps them so many consumers can read and replay at their own pace',
        'Logs can’t be partitioned',
        'Queues keep messages forever',
        'Logs only support one consumer',
      ],
      answer: 0,
      explain: 'Queues distribute tasks among workers. Logs retain an ordered history that independent consumer groups read and can rewind.',
    },
    {
      type: 'choice',
      q: 'In Kafka, ordering is guaranteed:',
      options: ['Within a partition', 'Across the whole topic', 'Across all topics', 'Never'],
      answer: 0,
      explain: 'Messages with the same key go to the same partition and stay in order. There is no global order across partitions.',
    },
    {
      type: 'choice',
      q: 'What is a dead-letter queue for?',
      options: [
        'Holding messages that repeatedly fail processing, so they don’t block the queue and can be inspected',
        'Deleting old messages',
        'Storing messages for deleted users',
        'Speeding up delivery',
      ],
      answer: 0,
      explain: 'After a set number of failed attempts, a “poison” message is moved aside for investigation while others keep flowing.',
    },
    {
      type: 'number',
      q: 'A topic receives 60,000 messages/s and one consumer instance processes 4,000 messages/s. How many partitions (and consumers) do you need at minimum?',
      answer: 15,
      unit: 'partitions',
      tolerance: 0.1,
      explain: '60,000 ÷ 4,000 = 15. In a consumer group each partition is read by one consumer, so partitions cap parallelism.',
    },
  ],
  'pub-sub': [
    {
      type: 'choice',
      q: 'What does publish/subscribe decouple?',
      options: [
        'Publishers don’t need to know who the subscribers are or how many there are',
        'Reads from writes in a database',
        'Frontend from CSS',
        'Clients from DNS',
      ],
      answer: 0,
      explain: 'A publisher emits an event once; any number of subscribers receive it, and new ones can be added without changing the publisher.',
    },
    {
      type: 'choice',
      q: 'What is a risk of using pub/sub for everything?',
      options: [
        'It gets hard to see who depends on which events, and a change in an event can break unknown consumers',
        'Messages are always delivered in global order',
        'It requires synchronous calls',
        'It cannot scale',
      ],
      answer: 0,
      explain: 'Loose coupling hides dependencies. Event schemas need versioning, and flows need tracing to stay understandable.',
    },
    {
      type: 'choice',
      q: 'In a chat system, why might each user have their own pub/sub channel?',
      options: [
        'So the gateway holding that user’s connection can subscribe and push their messages in real time',
        'To store message history',
        'To encrypt messages',
        'To rate-limit users',
      ],
      answer: 0,
      explain: 'Per-user channels route messages to whichever gateway server the user is connected to, without a central lookup per message.',
    },
  ],
  'transactional-outbox': [
    {
      type: 'choice',
      q: 'What problem does the transactional outbox solve?',
      options: [
        'A service updating its database and publishing an event, where one can succeed and the other fail',
        'Slow database queries',
        'Sending emails faster',
        'Large message sizes',
      ],
      answer: 0,
      explain: 'The “dual write” problem: commit then publish risks losing the event; publish then commit risks a phantom event.',
    },
    {
      type: 'choice',
      q: 'How does the outbox pattern work?',
      options: [
        'Write the event to an outbox table in the same transaction as the state change; a relay publishes it afterwards',
        'Publish the event first, then write to the database',
        'Write events only to a log file',
        'Ask consumers to poll the main tables',
      ],
      answer: 0,
      explain: 'Both rows commit atomically. A relay (polling or change data capture) publishes outbox rows and marks them sent.',
    },
    {
      type: 'choice',
      q: 'What delivery guarantee does an outbox relay typically provide?',
      options: ['At-least-once, so consumers must be idempotent', 'Exactly-once with no effort', 'At-most-once', 'No guarantee'],
      answer: 0,
      explain: 'The relay may publish and crash before marking the row sent, then publish again. Consumers dedupe by event ID.',
    },
  ],
  'event-sourcing': [
    {
      type: 'choice',
      q: 'In event sourcing, what is the source of truth?',
      options: [
        'An append-only log of events describing every change',
        'The latest row in a table',
        'A nightly backup',
        'The cache',
      ],
      answer: 0,
      explain: 'Current state is derived by replaying events (often from a snapshot). History comes for free.',
    },
    {
      type: 'choice',
      q: 'Why are snapshots used with event sourcing?',
      options: [
        'So rebuilding state doesn’t require replaying every event since the beginning',
        'To delete old events',
        'To make events mutable',
        'To encrypt events',
      ],
      answer: 0,
      explain: 'A snapshot captures state at a point; you replay only the events after it.',
    },
    {
      type: 'choice',
      q: 'What is a real challenge of event sourcing?',
      options: [
        'Evolving event schemas over years, since old events must still be readable',
        'It can’t record history',
        'It forbids audit logs',
        'Events can be edited freely',
      ],
      answer: 0,
      explain: 'Events are permanent, so you version them and keep code that understands old formats (or upcast them on read).',
    },
  ],
  cqrs: [
    {
      type: 'choice',
      q: 'What does CQRS separate?',
      options: [
        'The model used for writes (commands) from the models used for reads (queries)',
        'SQL from NoSQL',
        'Frontend from backend',
        'Caching from storage',
      ],
      answer: 0,
      explain: 'Writes go through a model that enforces rules; reads come from projections shaped for each query, updated from the write side.',
    },
    {
      type: 'choice',
      q: 'What do users experience as a side effect of CQRS with asynchronous projections?',
      options: [
        'Read models can lag slightly behind writes (eventual consistency)',
        'Writes become impossible',
        'Reads are always slower',
        'Data is lost on every write',
      ],
      answer: 0,
      explain: 'Projections update after the write commits. Products often show the user’s own change optimistically to hide the lag.',
    },
    {
      type: 'choice',
      q: 'A precomputed home timeline per user, built from post events, is an example of:',
      options: ['A CQRS read model', 'Two-phase commit', 'A Bloom filter', 'Leader election'],
      answer: 0,
      explain: 'The timeline is a read-optimized projection derived from writes to the posts store.',
    },
  ],
  'stream-processing': [
    {
      type: 'choice',
      q: 'What is the difference between event time and processing time?',
      options: [
        'Event time is when it happened; processing time is when the system sees it, which can be much later',
        'They are always identical',
        'Event time is only used in batch jobs',
        'Processing time is stored in the event',
      ],
      answer: 0,
      explain: 'Mobile clients go offline and networks delay events. Windowing by event time gives correct results despite late arrivals.',
    },
    {
      type: 'choice',
      q: 'What is a watermark in stream processing?',
      options: [
        'An estimate that no more events older than a given time are expected, so a window can be closed',
        'A security label on events',
        'The maximum message size',
        'A backup of the stream',
      ],
      answer: 0,
      explain: 'Watermarks trade completeness for latency; events arriving after the watermark are handled as late data.',
    },
    {
      type: 'choice',
      q: 'Which windowing type groups events by bursts of activity separated by gaps?',
      options: ['Session windows', 'Tumbling windows', 'Sliding windows', 'Global windows'],
      answer: 0,
      explain: 'Session windows close after a period of inactivity, which suits user sessions. Tumbling windows are fixed and non-overlapping.',
    },
  ],
}

export default quizzes
