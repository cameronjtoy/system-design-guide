import { useSearchParams } from 'react-router'
import { CATEGORIES, DIFFICULTIES, type Difficulty } from '../content/meta'
import { principles } from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { CardGrid, EntryCard } from '../components/EntryCard'
import styles from './IndexPage.module.css'

const LEVEL_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function PrinciplesIndex() {
  useDocumentTitle('Principles')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const level = (params.get('level') ?? '') as Difficulty | ''

  const setFilter = (key: 'category' | 'level', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const visible = principles.filter((p) => (!category || p.category === category) && (!level || p.difficulty === level))
  const categories = CATEGORIES.filter((c) => principles.some((p) => p.category === c.id))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Principles</h1>
        <p>
          {principles.length} building blocks of large systems, grouped by topic. Each page covers the problem, how it
          works, trade-offs, real-world use and the failures that taught it.
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.chips} role="group" aria-label="Topic">
          <button type="button" className={styles.chip} aria-pressed={!category} onClick={() => setFilter('category', '')}>
            All topics
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.chip}
              aria-pressed={category === c.id}
              onClick={() => setFilter('category', category === c.id ? '' : c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={styles.chips} role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              className={styles.chip}
              aria-pressed={level === d}
              onClick={() => setFilter('level', level === d ? '' : d)}
            >
              {LEVEL_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {categories.map((c) => {
        const items = visible.filter((p) => p.category === c.id)
        if (items.length === 0) return null
        return (
          <section key={c.id} className={styles.section}>
            <h2>{c.label}</h2>
            <p className={styles.sectionLead}>{c.description}</p>
            <CardGrid>
              {items.map((p) => (
                <EntryCard key={p.slug} entry={p} showEyebrow={false} />
              ))}
            </CardGrid>
          </section>
        )
      })}

      {visible.length === 0 && <p className={styles.empty}>No principles match these filters yet.</p>}
    </div>
  )
}
