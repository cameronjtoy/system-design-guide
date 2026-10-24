import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import type { MDXProps } from 'mdx/types'
import type { CollectionId, Entry, Heading, Source } from '../content/meta'
import { COLLECTIONS } from '../content/meta'
import {
  caseStudiesFor,
  categoryLabel,
  entryPath,
  formatDate,
  getEntry,
  loadBody,
  neighbours,
  postmortemsFor,
  relatedPrinciples,
  resolvePrinciples,
} from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { mdxComponents } from '../components/Mdx'
import { Toc } from '../components/Toc'
import { CardGrid, EntryCard } from '../components/EntryCard'
import { DifficultyTag, Pill } from '../components/Tags'
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon } from '../components/Icons'
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
    const related = relatedPrinciples(entry)
    if (failures.length) {
      sections.push({
        id: 'learn-from-failures',
        title: 'Learn from failures',
        node: <CardGrid>{failures.map((e) => <EntryCard key={e.slug} entry={e} />)}</CardGrid>,
      })
    }
    if (stories.length) {
      sections.push({
        id: 'in-the-real-world',
        title: 'In the real world',
        node: <CardGrid>{stories.map((e) => <EntryCard key={e.slug} entry={e} />)}</CardGrid>,
      })
    }
    if (related.length) {
      sections.push({
        id: 'related-principles',
        title: 'Related principles',
        node: <CardGrid>{related.map((e) => <EntryCard key={e.slug} entry={e} compact />)}</CardGrid>,
      })
    }
  } else {
    const involved = resolvePrinciples(entry.principles)
    if (involved.length) {
      sections.push({
        id: 'principles-in-play',
        title: 'Principles in play',
        node: <CardGrid>{involved.map((e) => <EntryCard key={e.slug} entry={e} compact />)}</CardGrid>,
      })
    }
  }
  if (entry.sources.length) {
    sections.push({ id: 'sources', title: 'Sources', node: <SourceList sources={entry.sources} /> })
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

function EntryHeader({ entry }: { entry: Entry }) {
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
      <h1 className={styles.title}>{entry.title}</h1>
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
            <div>
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
  useDocumentTitle(entry?.title)

  if (!entry) return <NotFound />

  const sections = footerSections(entry)
  const headings: Heading[] = [
    ...entry.headings,
    ...sections.map((s) => ({ depth: 2 as const, text: s.title, id: s.id })),
  ]
  const { prev, next } = entry.collection === 'principles' ? neighbours(entry) : {}

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        <EntryHeader entry={entry} />
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
