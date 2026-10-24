import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { CATEGORIES, COLLECTIONS } from '../content/meta'
import { caseStudies, getPrinciple, postmortems, principlesInCategory } from '../lib/content'
import { ChevronIcon } from './Icons'
import styles from './Sidebar.module.css'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link

export function Sidebar() {
  const { pathname } = useLocation()
  const currentCategory = pathname.startsWith('/principles/')
    ? getPrinciple(pathname.split('/')[2])?.category
    : undefined
  const [open, setOpen] = useState<Set<string>>(() => new Set(currentCategory ? [currentCategory] : []))

  // Reveal the category of the page being read.
  useEffect(() => {
    if (currentCategory) setOpen((prev) => (prev.has(currentCategory) ? prev : new Set(prev).add(currentCategory)))
  }, [currentCategory])

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const counts: Record<string, number> = {
    postmortems: postmortems.length,
    'case-studies': caseStudies.length,
  }

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>

      <div className={styles.section}>
        <NavLink to="/principles" end className={({ isActive }) => `${styles.heading} ${isActive ? styles.active : ''}`}>
          Principles
        </NavLink>
        {CATEGORIES.map((cat) => {
          const items = principlesInCategory(cat.id)
          if (items.length === 0) return null
          const isOpen = open.has(cat.id)
          return (
            <div key={cat.id} className={styles.group}>
              <button
                type="button"
                className={styles.groupToggle}
                aria-expanded={isOpen}
                onClick={() => toggle(cat.id)}
              >
                <ChevronIcon width={16} height={16} className={styles.chevron} data-open={isOpen} />
                <span>{cat.label}</span>
                <span className={styles.count}>{items.length}</span>
              </button>
              {isOpen && (
                <ul className={styles.list}>
                  {items.map((p) => (
                    <li key={p.slug}>
                      <NavLink to={`/principles/${p.slug}`} className={linkClass}>
                        {p.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Real world</div>
        {COLLECTIONS.filter((c) => c.id !== 'principles').map((c) => (
          <NavLink key={c.id} to={`/${c.id}`} className={linkClass}>
            <span>{c.label}</span>
            <span className={styles.count}>{counts[c.id]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
