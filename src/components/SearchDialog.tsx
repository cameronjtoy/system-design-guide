import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import type MiniSearch from 'minisearch'
import { COLLECTIONS, type SearchDoc } from '../content/meta'
import { CloseIcon, SearchIcon } from './Icons'
import styles from './SearchDialog.module.css'

type Index = MiniSearch<SearchDoc>
type Hit = Pick<SearchDoc, 'id' | 'collection' | 'slug' | 'title' | 'summary'>

// Built once, the first time search opens.
let indexPromise: Promise<Index> | undefined
function loadIndex(): Promise<Index> {
  indexPromise ??= Promise.all([import('minisearch'), import('virtual:search-docs')]).then(
    ([{ default: MiniSearchCtor }, { default: docs }]) => {
      const index = new MiniSearchCtor<SearchDoc>({
        fields: ['title', 'summary', 'tags', 'headings', 'body'],
        storeFields: ['collection', 'slug', 'title', 'summary'],
        searchOptions: {
          boost: { title: 4, tags: 2.5, headings: 2, summary: 2 },
          prefix: true,
          fuzzy: 0.2,
        },
      })
      index.addAll(docs)
      return index
    },
  )
  return indexPromise
}

const collectionLabel = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c.singular]))

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<Index>()
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()
  const listId = useId()

  useEffect(() => {
    loadIndex().then(setIndex, () => {
      indexPromise = undefined
      setFailed(true)
    })
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const hits: Hit[] = useMemo(() => {
    const q = query.trim()
    if (!index || !q) return []
    return index.search(q).slice(0, 20) as unknown as Hit[]
  }, [index, query])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (hit: Hit) => {
    onClose()
    navigate(`/${hit.collection}/${hit.slug}`)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && hits[active]) {
      e.preventDefault()
      go(hits[active])
    }
  }

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKeyDown}>
        <div className={styles.inputRow}>
          <SearchIcon className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            placeholder="Search principles, outages, companies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls={listId}
            aria-activedescendant={hits[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>

        <ul ref={listRef} id={listId} role="listbox" className={styles.results}>
          {hits.map((hit, i) => (
            <li
              key={hit.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              data-active={i === active}
              className={styles.result}
              onMouseMove={() => setActive(i)}
              onClick={() => go(hit)}
            >
              <span className={styles.kind}>{collectionLabel[hit.collection]}</span>
              <span className={styles.title}>{hit.title}</span>
              <span className={styles.summary}>{hit.summary}</span>
            </li>
          ))}
        </ul>

        {query.trim() && index && hits.length === 0 && (
          <p className={styles.empty}>No results for “{query.trim()}”.</p>
        )}
        {!index && !failed && query.trim() && <p className={styles.empty}>Loading search…</p>}
        {failed && <p className={styles.empty}>Search couldn’t load. Check your connection and try again.</p>}
        {!query.trim() && (
          <p className={styles.hint}>
            Try <em>cache</em>, <em>sharding</em>, <em>outage</em> or a company name.
          </p>
        )}
      </div>
    </div>
  )
}
