import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import type { MDXProps } from 'mdx/types'
import type { CollectionId, Entry, Heading, Source } from '../content/meta'
import { COLLECTIONS } from '../content/meta'
import {
  caseStudiesFor,
  categoryLabel,
  entryId,
  entryPath,
  formatDate,
  getEntry,
  loadBody,
  neighbours,
  postmortemsFor,
  practiceFor,
  relatedPrinciples,
  resolvePrinciples,
} from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { toggleLearned, useLearned } from '../lib/progress'
import { mdxComponents } from '../components/Mdx'
import { Toc } from '../components/Toc'
import { LessonQuiz } from '../components/Quiz'
import { CardGrid, EntryCard } from '../components/EntryCard'
import { DifficultyTag, Pill } from '../components/Tags'
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CheckIcon, ExternalIcon } from '../components/Icons'
import { NotFound } from './NotFound'
import styles from './EntryPage.module.css'

type Body = ComponentType<MDXProps>

/** Loads the MDX body for an entry, keyed so a stale load never wins. */
function useBody(entry: Entry | undefined) {
  const [state, setState] = useState<{ file?: string; Body?: Body; error?: string }>({})
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!entry) return
    let cancelled = false
    loadBody(entry).then(
      (mod) => !cancelled && setState({ file: entry.file, Body: mod.default }),
      (e: Error) => !cancelled && setState({ file: entry.file, error: e.message }),
    )
    return () => {
      cancelled = true
    }
  }, [entry, attempt])
  const current = state.file === entry?.file ? state : {}
  return { ...current, retry: () => setAttempt((a) => a + 1) }
}

interface Section {
  id: string
  title: string
  node: ReactNode
}

function footerSections(entry: Entry): Section[] {
  const sections: Section[] = []
  if (entry.collection === 'principles') {
    const failures = postmortemsFor(entry.slug)
    const stories = caseStudiesFor(entry.slug)
    const practice = practiceFor(entry.slug)
    const related = relatedPrinciples(entry)
    sections.push({
      id: 'auto-quiz',
      title: 'Check yourself',
      node: <LessonQuiz slug={entry.slug} category={entry.category} />,
    })
    if (failures.length) {
      sections.push({
        id: 'auto-postmortems',
        title: 'Learn from failures',
        node: <CardGrid>{failures.map((e) => <EntryCard key={e.slug} entry={e} />)}</CardGrid>,
      })
    }
    if (stories.length) {
      sections.push({
        id: 'auto-case-studies',
        title: 'Case studies',
        node: <CardGrid>{stories.map((e) => <EntryCard key={e.slug} entry={e} />)}</CardGrid>,
      })
    }
    if (practice.length) {
      sections.push({
        id: 'auto-practice',
        title: 'Practice problems',
        node: <CardGrid>{practice.map((e) => <EntryCard key={e.slug} entry={e} />)}</CardGrid>,
      })
    }
    if (related.length) {
      sections.push({
        id: 'auto-related',
        title: 'Related principles',
        node: <CardGrid>{related.map((e) => <EntryCard key={e.slug} entry={e} compact />)}</CardGrid>,
      })
    }
  } else {
    const involved = resolvePrinciples(entry.principles)
    if (involved.length) {
      sections.push({
        id: 'auto-principles',
        title: 'Principles in play',
        node: <CardGrid>{involved.map((e) => <EntryCard key={e.slug} entry={e} compact />)}</CardGrid>,
      })
    }
  }
  if (entry.sources.length) {
    sections.push({ id: 'auto-sources', title: 'Sources', node: <SourceList sources={entry.sources} /> })
  }
  return sections
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className={styles.sources}>
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title}
            <ExternalIcon width={14} height={14} className={styles.externalIcon} />
          </a>
          <span className={styles.host}>{new URL(s.url).hostname.replace(/^www\./, '')}</span>
        </li>
      ))}
    </ul>
  )
}

function EntryHeader({ entry, learned }: { entry: Entry; learned: boolean }) {
  const collection = COLLECTIONS.find((c) => c.id === entry.collection)!
  return (
    <header className={styles.header}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link to={`/${collection.id}`}>{collection.label}</Link>
        {entry.collection === 'principles' && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/principles?category=${entry.category}`}>{categoryLabel(entry.category)}</Link>
          </>
        )}
      </nav>
      <h1 className={styles.title}>
        {entry.title}
        {learned && (
          <span className={styles.learnedBadge} title="You marked this as learned">
            <CheckIcon width={16} height={16} />
            <span className="visually-hidden">Learned</span>
          </span>
        )}
      </h1>
      <p className={styles.lead}>{entry.summary}</p>

      {entry.collection === 'principles' && (
        <div className={styles.meta}>
          <DifficultyTag level={entry.difficulty} />
          <Pill>{entry.readingMinutes} min read</Pill>
          {entry.companies.length > 0 && (
            <span className={styles.companies}>Used at {entry.companies.join(', ')}</span>
          )}
        </div>
      )}

      {entry.collection === 'postmortems' && (
        <dl className={styles.facts}>
          <div>
            <dt>Company</dt>
            <dd>{entry.company}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDate(entry.date)}</dd>
          </div>
          {entry.duration && (
            <div className={styles.factDuration}>
              <dt>Duration</dt>
              <dd>{entry.duration}</dd>
            </div>
          )}
          <div className={styles.factWide}>
            <dt>Impact</dt>
            <dd>{entry.impact}</dd>
          </div>
        </dl>
      )}

      {entry.collection === 'practice' && (
        <div className={styles.meta}>
          <DifficultyTag level={entry.difficulty} />
          <Pill>{entry.readingMinutes} min read</Pill>
          <span className={styles.companies}>Try it yourself before opening the hints</span>
        </div>
      )}

      {entry.collection === 'case-studies' && (
        <div className={styles.meta}>
          <Pill>{entry.company}</Pill>
          <Pill>{entry.year}</Pill>
          <Pill>{entry.readingMinutes} min read</Pill>
        </div>
      )}
    </header>
  )
}

export function EntryPage({ collection }: { collection: CollectionId }) {
  const { slug = '' } = useParams()
  const entry = getEntry(collection, slug)
  const { Body, error, retry } = useBody(entry)
  const learnedSet = useLearned()
  useDocumentTitle(entry?.title)

  if (!entry) return <NotFound />

  const sections = footerSections(entry)
  const headings: Heading[] = [
    ...entry.headings,
    ...sections.map((s) => ({ depth: 2 as const, text: s.title, id: s.id })),
  ]
  const { prev, next } = entry.collection === 'principles' ? neighbours(entry) : {}
  const id = entryId(entry)
  const learned = learnedSet.has(id)

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        <EntryHeader entry={entry} learned={learned} />
        {Body && (
          <div className={styles.inlineToc}>
            <Toc headings={headings} variant="inline" />
          </div>
        )}

        <div className="prose">
          {Body ? (
            <Body components={mdxComponents} />
          ) : error ? (
            <div className={styles.loadError} role="alert">
              <p>This page couldn’t load. The site may have just been updated.</p>
              <button type="button" onClick={() => window.location.reload()}>Reload page</button>{' '}
              <button type="button" onClick={retry}>Try again</button>
            </div>
          ) : (
            <div className={styles.skeleton} aria-busy="true" aria-label="Loading">
              <span />
              <span />
              <span />
            </div>
          )}

          {Body &&
            sections.map((s) => (
              <section key={s.id} className={styles.footerSection}>
                <h2 id={s.id}>{s.title}</h2>
                {s.node}
              </section>
            ))}
        </div>

        {Body && (
          <div className={styles.learnedRow}>
            <button
              type="button"
              className={styles.learnedButton}
              aria-pressed={learned}
              onClick={() => toggleLearned(id)}
            >
              <CheckCircleIcon width={20} height={20} />
              {learned ? 'Learned' : 'Mark as learned'}
            </button>
            <span className={styles.learnedHint}>
              {learned ? 'Saved in this browser. Tap again to undo.' : 'Track your progress on the My progress page.'}
            </span>
          </div>
        )}

        {(prev || next) && (
          <nav className={styles.pager} aria-label="More principles">
            {prev ? (
              <Link to={entryPath(prev)} className={styles.pagerLink}>
                <span className={styles.pagerLabel}>
                  <ArrowLeftIcon width={16} height={16} /> Previous
                </span>
                <span>{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={entryPath(next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span className={styles.pagerLabel}>
                  Next <ArrowRightIcon width={16} height={16} />
                </span>
                <span>{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {Body && (
        <aside className={styles.sideToc}>
          <Toc headings={headings} variant="side" />
        </aside>
      )}
    </div>
  )
}
