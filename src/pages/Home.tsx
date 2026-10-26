import { Link } from 'react-router'
import { CATEGORIES } from '../content/meta'
import { PATHS, pathSteps } from '../content/paths'
import { countLearned, useLearned } from '../lib/progress'
import { ProgressBar } from '../components/ProgressBar'
import { caseStudies, entryPath, postmortems, principles, principlesInCategory } from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { CardGrid, EntryCard } from '../components/EntryCard'
import { ArrowRightIcon } from '../components/Icons'
import styles from './Home.module.css'

export function Home() {
  useDocumentTitle()
  const first = principles[0]
  const learned = useLearned()

  const stats = [
    { value: principles.length, label: 'Principles' },
    { value: postmortems.length, label: 'Postmortems' },
    { value: caseStudies.length, label: 'Case studies' },
    { value: CATEGORIES.length, label: 'Topics' },
  ]

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>System design, from first principles</p>
        <h1 className={styles.title}>Learn how large systems work, and how they fail.</h1>
        <p className={styles.lead}>
          Each principle is explained on its own page, then tied to real outages and to the way companies like
          Amazon, Netflix, Discord and Meta solved the same problem in production. Includes a full track on AI
          infrastructure.
        </p>
        <div className={styles.actions}>
          {first && (
            <Link to={entryPath(first)} className={styles.primary}>
              Start learning <ArrowRightIcon width={18} height={18} />
            </Link>
          )}
          <Link to="/quiz" className={styles.secondary}>
            Quick practice
          </Link>
          <Link to="/postmortems" className={styles.secondary}>
            Browse outages
          </Link>
        </div>
        <dl className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Learning paths</h2>
          <Link to="/paths">All paths</Link>
        </div>
        <div className={styles.paths}>
          {PATHS.map((p) => {
            const steps = pathSteps(p)
            return (
              <Link key={p.slug} to={`/paths/${p.slug}`} className={styles.path}>
                <span className={styles.pathTitle}>{p.title}</span>
                <span className={styles.pathMeta}>{p.duration}</span>
                <ProgressBar done={countLearned(steps, learned)} total={steps.length} label={`${p.title} progress`} />
              </Link>
            )
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Topics</h2>
        <div className={styles.topics}>
          {CATEGORIES.map((c, i) => {
            const count = principlesInCategory(c.id).length
            const body = (
              <>
                <span className={styles.topicNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.topicTitle}>{c.label}</span>
                <span className={styles.topicDesc}>{c.description}</span>
                <span className={styles.topicCount}>{count > 0 ? `${count} principles` : 'Coming soon'}</span>
              </>
            )
            return count > 0 ? (
              <Link key={c.id} to={`/principles?category=${c.id}`} className={styles.topic}>
                {body}
              </Link>
            ) : (
              <div key={c.id} className={styles.topic} data-empty="true">
                {body}
              </div>
            )
          })}
        </div>
      </section>

      {postmortems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Learn from outages</h2>
            <Link to="/postmortems">All postmortems</Link>
          </div>
          <CardGrid>
            {postmortems.slice(0, 3).map((e) => (
              <EntryCard key={e.slug} entry={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {caseStudies.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>How companies built it</h2>
            <Link to="/case-studies">All case studies</Link>
          </div>
          <CardGrid>
            {caseStudies.slice(0, 3).map((e) => (
              <EntryCard key={e.slug} entry={e} />
            ))}
          </CardGrid>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Go deeper</h2>
        </div>
        <p className={styles.deeper}>
          The <Link to="/reading">reading list</Link> collects the engineering blogs, incident report archives, papers,
          books and UI design systems behind this guide.
        </p>
      </section>
    </div>
  )
}
