import type { RefObject } from 'react'
import { Link } from 'react-router'
import { useTheme } from '../lib/theme'
import { CloseIcon, LogoMark, MenuIcon, MoonIcon, SearchIcon, SunIcon } from './Icons'
import styles from './Header.module.css'

interface HeaderProps {
  menuOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onMenu: () => void
  onSearch: () => void
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function Header({ menuOpen, menuButtonRef, onMenu, onSearch }: HeaderProps) {
  const [theme, toggleTheme] = useTheme()

  return (
    <header className={styles.header}>
      <button
        ref={menuButtonRef}
        type="button"
        className={`${styles.iconButton} ${styles.menu}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={onMenu}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <Link to="/" className={styles.brand}>
        <LogoMark />
        <span>System Design Guide</span>
      </Link>

      <div className={styles.actions}>
        <button type="button" className={styles.search} onClick={onSearch} aria-label="Search">
          <SearchIcon width={18} height={18} />
          <span className={styles.searchLabel}>Search</span>
          <kbd className={styles.kbd}>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
