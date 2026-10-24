import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import styles from './IndexPage.module.css'

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Page not found</h1>
        <p>
          That page doesn’t exist, or it may not have been written yet. Try search, or go back to the{' '}
          <Link to="/">home page</Link>.
        </p>
      </header>
    </div>
  )
}
