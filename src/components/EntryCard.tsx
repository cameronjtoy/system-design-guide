import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Entry } from '../content/meta'
import { categoryLabel, entryId, entryPath, formatDate } from '../lib/content'
import { useLearned } from '../lib/progress'
import { CheckIcon } from './Icons'
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
    case 'practice':
      return 'Practice problem'
  }
}

interface EntryCardProps {
  entry: Entry
  compact?: boolean
  /** Hide the category/company line when the surrounding section already says it. */
  showEyebrow?: boolean
}

export function EntryCard({ entry, compact = false, showEyebrow = true }: EntryCardProps) {
  const learned = useLearned().has(entryId(entry))
  const showLevel = entry.collection === 'principles' || entry.collection === 'practice'
  return (
    <Link to={entryPath(entry)} className={styles.card} data-compact={compact} data-learned={learned}>
      {learned && (
        <span className={styles.check} title="Learned">
          <CheckIcon width={14} height={14} />
          <span className="visually-hidden">Learned</span>
        </span>
      )}
      {showEyebrow && <span className={styles.eyebrow}>{eyebrow(entry)}</span>}
      <span className={styles.title}>{entry.title}</span>
      {!compact && <span className={styles.summary}>{entry.summary}</span>}
      {!compact && showLevel && (
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
