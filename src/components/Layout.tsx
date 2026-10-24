import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SearchDialog } from './SearchDialog'
import styles from './Layout.module.css'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  // New page: close the drawer and start at the top.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Lock page scroll behind the open drawer.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      menuButton.current?.focus()
    }
  }, [menuOpen])

  // ⌘K / Ctrl+K anywhere, or "/" outside text fields, opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main" onClick={(e) => {
        e.preventDefault()
        document.getElementById('main')?.focus()
      }}>
        Skip to content
      </a>
      <Header
        menuOpen={menuOpen}
        menuButtonRef={menuButton}
        onMenu={() => setMenuOpen((o) => !o)}
        onSearch={() => setSearchOpen(true)}
      />
      <div className={styles.body}>
        <div
          className={styles.overlay}
          data-open={menuOpen}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside className={styles.sidebar} data-open={menuOpen} id="site-nav" aria-label="Site">
          <Sidebar />
        </aside>
        <main id="main" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
      </div>
      {searchOpen && <SearchDialog onClose={closeSearch} />}
    </div>
  )
}
