import { READING } from '../content/reading'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ExternalIcon } from '../components/Icons'
import indexStyles from './IndexPage.module.css'
import styles from './Reading.module.css'

export function Reading() {
  useDocumentTitle('Reading list')
  return (
    <div className={indexStyles.page}>
      <header className={indexStyles.header}>
        <h1>Reading list</h1>
        <p>
          Primary sources for going deeper: engineering blogs, incident report collections, foundational papers, books,
          and the UI design systems that inspired this site.
        </p>
      </header>

      {READING.map((group) => (
        <section key={group.id} className={indexStyles.section} aria-labelledby={group.id}>
          <h2 id={group.id}>{group.title}</h2>
          <p className={indexStyles.sectionLead}>{group.intro}</p>
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.item}>
                  <span className={styles.title}>
                    {item.title}
                    <ExternalIcon width={14} height={14} className={styles.icon} />
                  </span>
                  <span className={styles.note}>{item.note}</span>
                  <span className={styles.host}>{new URL(item.url).hostname.replace(/^www\./, '')}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
