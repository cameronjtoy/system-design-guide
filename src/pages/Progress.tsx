import { useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIES } from '../content/meta'
import { PATHS, pathSteps } from '../content/paths'
import { caseStudies, entryId, postmortems, practiceProblems, principles, principlesInCategory } from '../lib/content'
import { countLearned, resetProgress, useLearned } from '../lib/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ProgressBar } from '../components/ProgressBar'
import indexStyles from './IndexPage.module.css'
import styles from './Progress.module.css'

export function Progress() {
  useDocumentTitle('My progress')
  const learned = useLearned()
  const [confirming, setConfirming] = useState(false)

  const groups = [
    { label: 'Principles', ids: principles.map(entryId), to: '/principles' },
    { label: 'Postmortems', ids: postmortems.map(entryId), to: '/postmortems' },
    { label: 'Case studies', ids: caseStudies.map(entryId), to: '/case-studies' },
    { label: 'Practice problems', ids: practiceProblems.map(entryId), to: '/practice' },
  ]
  const totalIds = groups.flatMap((g) => g.ids)
  const totalDone = countLearned(totalIds, learned)

  return (
    <div className={indexStyles.page}>
      <header className={indexStyles.header}>
        <h1>My progress</h1>
        <p>
          Pages you’ve marked as learned. Progress is stored only in this browser, so it won’t follow you to other
          devices.
        </p>
      </header>

      <div className={styles.overall}>
        <div className={styles.big}>
          <span className={styles.bigNumber}>{totalDone}</span>
          <span className={styles.bigLabel}>of {totalIds.length} pages learned</span>
        </div>
        <ProgressBar done={totalDone} total={totalIds.length} label="Overall progress" showCount={false} />
      </div>

      <section className={indexStyles.section}>
        <h2>By collection</h2>
        <div className={styles.rows}>
          {groups.map((g) => (
            <div key={g.label} className={styles.row}>
              <Link to={g.to} className={styles.rowLabel}>
                {g.label}
              </Link>
              <ProgressBar done={countLearned(g.ids, learned)} total={g.ids.length} label={`${g.label} progress`} />
            </div>
          ))}
        </div>
      </section>

      <section className={indexStyles.section}>
        <h2>Principles by topic</h2>
        <div className={styles.rows}>
          {CATEGORIES.map((c) => {
            const ids = principlesInCategory(c.id).map(entryId)
            if (ids.length === 0) return null
            return (
              <div key={c.id} className={styles.row}>
                <Link to={`/principles?category=${c.id}`} className={styles.rowLabel}>
                  {c.label}
                </Link>
                <ProgressBar done={countLearned(ids, learned)} total={ids.length} label={`${c.label} progress`} />
              </div>
            )
          })}
        </div>
      </section>

      <section className={indexStyles.section}>
        <h2>Learning paths</h2>
        <div className={styles.rows}>
          {PATHS.map((p) => {
            const steps = pathSteps(p)
            return (
              <div key={p.slug} className={styles.row}>
                <Link to={`/paths/${p.slug}`} className={styles.rowLabel}>
                  {p.title}
                </Link>
                <ProgressBar done={countLearned(steps, learned)} total={steps.length} label={`${p.title} progress`} />
              </div>
            )
          })}
        </div>
      </section>

      <section className={indexStyles.section}>
        <h2>Start over</h2>
        {confirming ? (
          <div className={styles.confirm}>
            <span>Clear all progress in this browser?</span>
            <button
              type="button"
              className={styles.danger}
              onClick={() => {
                resetProgress()
                setConfirming(false)
              }}
            >
              Yes, clear it
            </button>
            <button type="button" className={styles.secondary} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setConfirming(true)}
            disabled={learned.size === 0}
          >
            Reset progress
          </button>
        )}
      </section>
    </div>
  )
}
