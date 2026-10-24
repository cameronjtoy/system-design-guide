import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Entry } from '../content/meta'
import { categoryLabel, entryPath, formatDate } from '../lib/content'
import { DifficultyTag } from './Tags'
import styles from './EntryCard.module.css'

function eyebrow(entry: Entry): string {
  switch (entry.collection) {
    case 'principles':
      return categoryLabel(entry.category)
    case 'postmortems':
      return `${entry.company} · ${formatDate(entry.date)}`
    case 'case-studies':
      return `${entry.company} · ${entry.year}`
  }
}

interface EntryCardProps {
  entry: Entry
  compact?: boolean
  /** Hide the category/company line when the surrounding section already says it. */
  showEyebrow?: boolean
}

export function EntryCard({ entry, compact = false, showEyebrow = true }: EntryCardProps) {
  return (
    <Link to={entryPath(entry)} className={styles.card} data-compact={compact}>
      {showEyebrow && <span className={styles.eyebrow}>{eyebrow(entry)}</span>}
      <span className={styles.title}>{entry.title}</span>
      {!compact && <span className={styles.summary}>{entry.summary}</span>}
      {!compact && entry.collection === 'principles' && (
        <span className={styles.meta}>
          <DifficultyTag level={entry.difficulty} />
          <span>{entry.readingMinutes} min read</span>
        </span>
      )}
    </Link>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
