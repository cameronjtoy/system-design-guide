import { Link, useSearchParams } from 'react-router'
import { CATEGORIES } from '../content/meta'
import { SCENE_NAMES } from '../animations/registry'
import { entryPath, getPrinciple } from '../lib/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Animation } from '../components/Animation'
import indexStyles from './IndexPage.module.css'
import styles from './Animations.module.css'

export function Animations() {
  useDocumentTitle('Animations')
  const [params, setParams] = useSearchParams()
  const principles = SCENE_NAMES.map((name) => getPrinciple(name)).filter((p) => p !== undefined)
  const current = principles.find((p) => p.slug === params.get('name')) ?? principles[0]

  return (
    <div className={styles.page}>
      <header className={indexStyles.header}>
        <h1>Animations</h1>
        <p>
          Watch how each idea works, one step at a time. Every animation also appears in its lesson under “How it
          works”.
        </p>
      </header>

      {current && (
        <section className={styles.stage} aria-label="Selected animation">
          <Animation name={current.slug} />
          <p className={styles.lessonLink}>
            From the lesson <Link to={entryPath(current)}>{current.title}</Link>
          </p>
        </section>
      )}

      {CATEGORIES.map((c) => {
        const items = principles.filter((p) => p.category === c.id)
        if (items.length === 0) return null
        return (
          <section key={c.id} className={indexStyles.section}>
            <h2>{c.label}</h2>
            <ul className={styles.list}>
              {items.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    className={styles.item}
                    aria-pressed={p.slug === current?.slug}
                    onClick={() => {
                      setParams({ name: p.slug }, { replace: true })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
