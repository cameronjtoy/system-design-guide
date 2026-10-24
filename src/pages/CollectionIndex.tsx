import { COLLECTIONS } from '../content/meta'
import { caseStudies, postmortems, practiceProblems } from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { CardGrid, EntryCard } from '../components/EntryCard'
import styles from './IndexPage.module.css'

/** Index for the non-principle collections: postmortems, case studies and practice problems. */
export function CollectionIndex({ collection }: { collection: 'postmortems' | 'case-studies' | 'practice' }) {
  const meta = COLLECTIONS.find((c) => c.id === collection)!
  useDocumentTitle(meta.label)
  const items = { postmortems, 'case-studies': caseStudies, practice: practiceProblems }[collection]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{meta.label}</h1>
        <p>{meta.description}</p>
      </header>
      <CardGrid>
        {items.map((e) => (
          <EntryCard key={e.slug} entry={e} />
        ))}
      </CardGrid>
      {items.length === 0 && <p className={styles.empty}>Nothing here yet.</p>}
    </div>
  )
}
