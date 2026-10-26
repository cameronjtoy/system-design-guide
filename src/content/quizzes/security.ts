import type { QuizBank } from './types.ts'

const quizzes: QuizBank = {
  'authentication-and-authorization': [
    {
      type: 'choice',
      q: 'What is the difference between authentication and authorization?',
      options: [
        'Authentication proves who you are; authorization decides what you’re allowed to do',
        'They are the same thing',
        'Authorization happens first, then authentication',
        'Authentication is only for APIs',
      ],
      answer: 0,
      explain: 'Logging in is authentication. Checking whether user 42 may read invoice 1002 is authorization, and it must happen on every request.',
    },
    {
      type: 'choice',
      q: 'Changing /invoices/1001 to /invoices/1002 shows another customer’s invoice. What is this vulnerability called?',
      options: [
        'Broken object-level authorization (IDOR)',
        'Cross-site scripting',
        'SQL injection',
        'Clickjacking',
      ],
      answer: 0,
      explain: 'The server checked that the user was logged in but not that they own the object. Check ownership or tenant on every object access.',
    },
    {
      type: 'choice',
      q: 'What is a downside of long-lived JWT access tokens?',
      options: [
        'They are hard to revoke before they expire, because servers verify them without a lookup',
        'They can’t contain user IDs',
        'They require a database query on every request',
        'They only work in browsers',
      ],
      answer: 0,
      explain: 'Use short-lived access tokens with refresh tokens, or keep a revocation list for emergencies.',
    },
  ],
  'api-design-and-versioning': [
    {
      type: 'choice',
      q: 'Which change to a public JSON API is backward compatible?',
      options: [
        'Adding a new optional field to a response',
        'Renaming an existing field',
        'Changing a field from a string to a number',
        'Removing an endpoint',
      ],
      answer: 0,
      explain: 'Clients that ignore unknown fields keep working. Renames, type changes and removals break existing clients.',
    },
    {
      type: 'choice',
      q: 'Why should API clients be built to ignore unknown fields and enum values?',
      options: [
        'So the server can evolve without breaking them',
        'To save memory',
        'Because JSON requires it',
        'To improve security',
      ],
      answer: 0,
      explain: 'Tolerant readers let providers add fields and states over time without coordinated releases.',
    },
    {
      type: 'choice',
      q: 'Which HTTP method is defined as idempotent?',
      options: ['PUT', 'POST', 'PATCH (by definition)', 'CONNECT'],
      answer: 0,
      explain: 'PUT replaces a resource, so repeating it has the same effect. POST is not idempotent unless you add an idempotency key.',
    },
  ],
  pagination: [
    {
      type: 'choice',
      q: 'Why does OFFSET-based pagination get slow on deep pages?',
      options: [
        'The database still reads and discards all the skipped rows',
        'OFFSET is not supported by indexes at all',
        'It returns too few rows',
        'It requires a full table lock',
      ],
      answer: 0,
      explain: 'OFFSET 1,000,000 means scanning a million rows to throw them away. Cursor (keyset) pagination seeks directly.',
    },
    {
      type: 'choice',
      q: 'What does a cursor for keyset pagination usually encode?',
      options: [
        'The sort key (and a tie-breaker ID) of the last item returned',
        'The page number',
        'The total row count',
        'The user’s password',
      ],
      answer: 0,
      explain: 'The next query is WHERE (created_at, id) < (last_created_at, last_id) ORDER BY … LIMIT n, which an index serves directly.',
    },
    {
      type: 'choice',
      q: 'New items are inserted while a user pages through a feed with OFFSET. What can happen?',
      options: [
        'Items shift between pages, so the user sees duplicates or misses items',
        'Nothing changes',
        'The query fails',
        'The cursor becomes invalid',
      ],
      answer: 0,
      explain: 'Offsets are positions, and positions move when data changes. Cursors anchor to actual items, so they stay stable.',
    },
  ],
  'secrets-and-config-management': [
    {
      type: 'choice',
      q: 'Where should production database passwords live?',
      options: [
        'In a secrets manager, fetched at runtime with access control and audit logs',
        'In the Git repository',
        'In a shared spreadsheet',
        'Hard-coded in the Docker image',
      ],
      answer: 0,
      explain: 'Secrets managers control access, rotate credentials and log every read. Anything committed to Git should be treated as leaked.',
    },
    {
      type: 'choice',
      q: 'Why should configuration changes roll out gradually, like code?',
      options: [
        'A bad config pushed everywhere at once can cause a global outage instantly',
        'Configs are larger than code',
        'Gradual rollout encrypts config',
        'It doesn’t matter',
      ],
      answer: 0,
      explain: 'Several major outages (including Google Cloud’s 2025 Service Control incident) came from config or policy changes that reached every region at once.',
    },
    {
      type: 'choice',
      q: 'What is the benefit of short-lived, automatically rotated credentials?',
      options: [
        'A leaked credential stops working soon, limiting damage',
        'They are easier to remember',
        'They make requests faster',
        'They remove the need for authorization',
      ],
      answer: 0,
      explain: 'Rotation shrinks the window in which a stolen secret is useful.',
    },
  ],
  'zero-trust-networking': [
    {
      type: 'choice',
      q: 'What is the core idea of zero trust?',
      options: [
        'Don’t trust requests because they come from inside the network; authenticate and authorize every request',
        'Never let employees access anything',
        'Disable all firewalls',
        'Trust only requests from the office',
      ],
      answer: 0,
      explain: 'Perimeter security fails once an attacker is inside. Zero trust checks identity and device on every call.',
    },
    {
      type: 'choice',
      q: 'How do services commonly prove their identity to each other in a zero-trust setup?',
      options: ['Mutual TLS with short-lived certificates', 'Shared passwords in config files', 'Source IP addresses', 'Hostnames'],
      answer: 0,
      explain: 'mTLS gives each workload a cryptographic identity, often issued and rotated automatically by a service mesh.',
    },
    {
      type: 'choice',
      q: 'Google’s BeyondCorp model let employees work without a traditional VPN by:',
      options: [
        'Granting access based on user and device identity and state, not network location',
        'Opening all internal apps to the internet with no checks',
        'Using only on-premises computers',
        'Requiring hardware tokens for every page load',
      ],
      answer: 0,
      explain: 'Access decisions use who the user is and whether their device is trusted, through an access proxy.',
    },
  ],
}

export default quizzes
