import { useEffect, useMemo, useRef, useState } from 'react'
import type { Heading } from '../content/meta'
import styles from './Toc.module.css'

// The router owns the URL hash, so headings are reached by scrolling rather
// than by #anchor links.
function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>()
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (els.length === 0) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) visible.add(r.target.id)
          else visible.delete(r.target.id)
        }
        const first = ids.find((id) => visible.has(id))
        if (first) setActive(first)
      },
      { rootMargin: '-64px 0px -65% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])
  return active
}

interface TocProps {
  headings: Heading[]
  /** 'side' is the desktop column; 'inline' is the collapsible box on smaller screens. */
  variant: 'side' | 'inline'
}

export function Toc({ headings, variant }: TocProps) {
  const key = headings.map((h) => h.id).join('|')
  const ids = useMemo(() => (key ? key.split('|') : []), [key])
  const active = useActiveHeading(ids)
  const details = useRef<HTMLDetailsElement>(null)
  if (headings.length < 2) return null

  const list = (
    <ul className={styles.list}>
      {headings.map((h) => (
        <li key={h.id} data-depth={h.depth}>
          <button
            type="button"
            className={styles.item}
            data-active={active === h.id}
            onClick={() => {
              if (details.current) details.current.open = false
              scrollToHeading(h.id)
            }}
          >
            {h.text}
          </button>
        </li>
      ))}
    </ul>
  )

  if (variant === 'inline') {
    return (
      <details ref={details} className={styles.inline}>
        <summary className={styles.summary}>On this page</summary>
        {list}
      </details>
    )
  }

  return (
    <nav className={styles.side} aria-label="On this page">
      <div className={styles.title}>On this page</div>
      {list}
    </nav>
  )
}
