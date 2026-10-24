import { Link, useParams } from 'react-router'
import { COLLECTIONS } from '../content/meta'
import { PATHS, pathSteps } from '../content/paths'
import { entryPath, getEntryById } from '../lib/content'
import { countLearned, toggleLearned, useLearned } from '../lib/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ProgressBar } from '../components/ProgressBar'
import { ArrowRightIcon, CheckIcon } from '../components/Icons'
import { NotFound } from './NotFound'
import indexStyles from './IndexPage.module.css'
import styles from './Paths.module.css'

const singular = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c.singular]))

export function PathsIndex() {
  useDocumentTitle('Learning paths')
  const learned = useLearned()
  return (
    <div className={indexStyles.page}>
      <header className={indexStyles.header}>
        <h1>Learning paths</h1>
        <p>
          Guided routes through the guide, mixing principles, real outages, case studies and practice problems. Your
          progress is saved in this browser.
        </p>
      </header>
      <div className={styles.grid}>
        {PATHS.map((path) => {
          const steps = pathSteps(path)
          return (
            <Link key={path.slug} to={`/paths/${path.slug}`} className={styles.card}>
              <span className={styles.duration}>{path.duration}</span>
              <span className={styles.title}>{path.title}</span>
              <span className={styles.summary}>{path.summary}</span>
              <span className={styles.audience}>For: {path.audience}</span>
              <ProgressBar done={countLearned(steps, learned)} total={steps.length} label={`${path.title} progress`} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function PathPage() {
  const { slug = '' } = useParams()
  const path = PATHS.find((p) => p.slug === slug)
  const learned = useLearned()
  useDocumentTitle(path?.title)
  if (!path) return <NotFound />

  const steps = pathSteps(path)
  const done = countLearned(steps, learned)
  const nextId = steps.find((id) => !learned.has(id))
  const nextEntry = nextId ? getEntryById(nextId) : undefined

  return (
    <div className={styles.page}>
      <header className={indexStyles.header}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link to="/paths">Learning paths</Link>
        </nav>
        <h1>{path.title}</h1>
        <p>{path.summary}</p>
      </header>

      <div className={styles.summaryBox}>
        <div className={styles.facts}>
          <span>
            <strong>For</strong> {path.audience}
          </span>
          <span>
            <strong>Time</strong> {path.duration}
          </span>
        </div>
        <ProgressBar done={done} total={steps.length} label={`${path.title} progress`} />
        {nextEntry ? (
          <Link to={entryPath(nextEntry)} className={styles.next}>
            {done === 0 ? 'Start' : 'Continue'}: {nextEntry.title} <ArrowRightIcon width={18} height={18} />
          </Link>
        ) : (
          <p className={styles.complete}>Path complete. Nice work.</p>
        )}
      </div>

      {path.sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2>{section.title}</h2>
          <ol className={styles.steps}>
            {section.steps.map((id) => {
              const entry = getEntryById(id)
              if (!entry) return null
              const isDone = learned.has(id)
              return (
                <li key={id} className={styles.step} data-done={isDone}>
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-pressed={isDone}
                    aria-label={isDone ? `Mark "${entry.title}" as not learned` : `Mark "${entry.title}" as learned`}
                    onClick={() => toggleLearned(id)}
                  >
                    {isDone && <CheckIcon width={16} height={16} />}
                  </button>
                  <Link to={entryPath(entry)} className={styles.stepLink}>
                    <span className={styles.stepKind}>{singular[entry.collection]}</span>
                    <span className={styles.stepTitle}>{entry.title}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
