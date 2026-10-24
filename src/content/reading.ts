// Curated reading list shown at /reading. Each link was chosen because it's a
// primary source: written by the people who built or ran the system.

export interface ReadingItem {
  title: string
  url: string
  note: string
}

export interface ReadingGroup {
  id: string
  title: string
  intro: string
  items: ReadingItem[]
}

export const READING: ReadingGroup[] = [
  {
    id: 'engineering-blogs',
    title: 'Engineering blogs',
    intro: 'Where companies explain how their systems work, and what broke along the way.',
    items: [
      {
        title: "Amazon Builders' Library",
        url: 'https://aws.amazon.com/builders-library/',
        note: 'Deep, practical articles on timeouts, load shedding, cells, shuffle sharding and deployments from senior AWS engineers.',
      },
      {
        title: 'Google SRE books',
        url: 'https://sre.google/books/',
        note: 'The SRE book, workbook and Building Secure & Reliable Systems, free to read online.',
      },
      {
        title: 'Netflix Tech Blog',
        url: 'https://netflixtechblog.com/',
        note: 'Chaos engineering, resilience, data platforms, streaming and ML infrastructure.',
      },
      {
        title: 'Meta Engineering',
        url: 'https://engineering.fb.com/',
        note: 'Caching at scale, TAO, data centers, networking and AI infrastructure.',
      },
      {
        title: 'Cloudflare Blog',
        url: 'https://blog.cloudflare.com/',
        note: 'Unusually detailed, fast postmortems, plus networking and edge computing internals.',
      },
      {
        title: 'All Things Distributed',
        url: 'https://www.allthingsdistributed.com/',
        note: "Werner Vogels (Amazon CTO) on Dynamo, S3, consistency and building at Amazon's scale.",
      },
      {
        title: 'Slack Engineering',
        url: 'https://slack.engineering/',
        note: 'Vitess migration, outage write-ups and real-time messaging infrastructure.',
      },
      {
        title: 'Shopify Engineering',
        url: 'https://shopify.engineering/',
        note: 'Pods, flash-sale resilience and running one of the largest Rails monoliths.',
      },
      {
        title: 'Dropbox Tech Blog',
        url: 'https://dropbox.tech/',
        note: 'Magic Pocket storage, sync engines and infrastructure at exabyte scale.',
      },
      {
        title: 'GitHub Engineering',
        url: 'https://github.blog/engineering/',
        note: 'MySQL high availability, monthly availability reports and incident analyses.',
      },
      {
        title: 'Uber Engineering',
        url: 'https://www.uber.com/blog/engineering/',
        note: 'Microservice architecture, real-time dispatch, data platforms and ML (Michelangelo).',
      },
    ],
  },
  {
    id: 'incident-reports',
    title: 'Incident report collections',
    intro: 'The best way to learn failure modes is to read lots of real ones.',
    items: [
      {
        title: 'danluu/post-mortems',
        url: 'https://github.com/danluu/post-mortems',
        note: 'A long-running, categorized collection of public postmortems from across the industry.',
      },
      {
        title: 'AWS Post-Event Summaries',
        url: 'https://aws.amazon.com/premiumsupport/technology/pes/',
        note: "AWS's official write-ups of its largest outages, kept online for at least five years.",
      },
      {
        title: 'Kubernetes Failure Stories',
        url: 'https://k8s.af/',
        note: 'Public incident reports involving Kubernetes clusters, grouped by cause.',
      },
      {
        title: 'Postmortem Culture: Learning from Failure (Google SRE book)',
        url: 'https://sre.google/sre-book/postmortem-culture/',
        note: 'How to write blameless postmortems that actually lead to fixes.',
      },
    ],
  },
  {
    id: 'papers',
    title: 'Papers worth reading',
    intro: 'Short, readable papers that introduced ideas used everywhere today.',
    items: [
      {
        title: "Dynamo: Amazon's Highly Available Key-value Store (2007)",
        url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
        note: 'Consistent hashing, quorums, vector clocks and the availability-first mindset.',
      },
      {
        title: 'In Search of an Understandable Consensus Algorithm (Raft, 2014)',
        url: 'https://raft.github.io/raft.pdf',
        note: 'Consensus designed to be understood: leader election, log replication and safety.',
      },
      {
        title: "Spanner: Google's Globally-Distributed Database (2012)",
        url: 'https://www.usenix.org/conference/osdi12/technical-sessions/presentation/corbett',
        note: 'TrueTime and globally consistent transactions.',
      },
      {
        title: 'The Tail at Scale (2013)',
        url: 'https://research.google/pubs/pub40801/',
        note: 'Why p99 latency dominates large systems, and hedged requests.',
      },
      {
        title: 'Scaling Memcache at Facebook (2013)',
        url: 'https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala',
        note: 'Leases, invalidation pipelines and running a cache at billions of requests per second.',
      },
      {
        title: "TAO: Facebook's Distributed Data Store for the Social Graph (2013)",
        url: 'https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson',
        note: 'A read-optimized, graph-aware cache tier in front of MySQL.',
      },
      {
        title: 'Maglev: A Fast and Reliable Software Network Load Balancer (2016)',
        url: 'https://www.usenix.org/conference/nsdi16/technical-sessions/presentation/eisenbud',
        note: 'Load balancing in software with consistent hashing and connection tracking.',
      },
      {
        title: "The Log: What every software engineer should know about real-time data's unifying abstraction",
        url: 'https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying',
        note: "Jay Kreps's essay behind Kafka and log-centric architecture.",
      },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    intro: 'For going deeper than any single article can.',
    items: [
      {
        title: 'Designing Data-Intensive Applications (Martin Kleppmann)',
        url: 'https://dataintensive.net/',
        note: 'The best single book on replication, partitioning, transactions, consistency and stream processing.',
      },
      {
        title: 'Site Reliability Engineering (Google)',
        url: 'https://sre.google/sre-book/table-of-contents/',
        note: 'SLOs, error budgets, overload handling, cascading failures and on-call, free online.',
      },
      {
        title: 'Release It! (Michael Nygard)',
        url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/',
        note: 'Stability patterns such as circuit breakers, bulkheads and timeouts, told through production war stories.',
      },
    ],
  },
  {
    id: 'design-systems',
    title: 'UI design systems',
    intro:
      "Design systems apply system-design thinking to interfaces: shared tokens, components and rules that let many teams build consistent products. This site's own UI (color tokens, spacing, components) follows the same approach.",
    items: [
      {
        title: 'Shopify Polaris',
        url: 'https://polaris.shopify.com/',
        note: "Shopify's design system for the merchant admin: guidance, components and tokens.",
      },
      {
        title: 'IBM Carbon',
        url: 'https://carbondesignsystem.com/',
        note: 'A mature open-source system with thorough guidance on accessibility, data visualization and theming.',
      },
      {
        title: 'Atlassian Design System',
        url: 'https://atlassian.design/',
        note: 'Foundations, tokens and components used across Jira, Confluence and Trello.',
      },
      {
        title: 'Material Design 3',
        url: 'https://m3.material.io/',
        note: "Google's system, notable for dynamic color and detailed component specs.",
      },
      {
        title: 'GOV.UK Design System',
        url: 'https://design-system.service.gov.uk/',
        note: 'Patterns tested with real users for accessible, plain-language government services.',
      },
      {
        title: 'Apple Human Interface Guidelines',
        url: 'https://developer.apple.com/design/human-interface-guidelines/',
        note: 'Platform conventions for iOS, macOS and beyond, including touch targets and typography.',
      },
      {
        title: 'Atomic Design (Brad Frost)',
        url: 'https://atomicdesign.bradfrost.com/',
        note: 'A free book on building interfaces from small components up to full pages.',
      },
    ],
  },
]
