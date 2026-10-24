import { isValidElement, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Link } from 'react-router'
import { Mermaid } from './Mermaid'
import styles from './Mdx.module.css'

type CalloutKind = 'tip' | 'example' | 'warning' | 'interview' | 'note'

const CALLOUT_TITLES: Record<CalloutKind, string> = {
  tip: 'Tip',
  example: 'Real-world example',
  warning: 'Watch out',
  interview: 'What to say',
  note: 'Note',
}

export function Callout({ type = 'note', title, children }: { type?: CalloutKind; title?: string; children: ReactNode }) {
  return (
    <aside className={`${styles.callout} ${styles[type]}`}>
      <div className={styles.calloutTitle}>{title ?? CALLOUT_TITLES[type]}</div>
      <div className={styles.calloutBody}>{children}</div>
    </aside>
  )
}

/** Internal links go through the router; external ones open in a new tab. */
function Anchor({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>
  if (href.startsWith('#')) return <a href={href} {...rest}>{children}</a>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

/** ```mermaid fences become diagrams; everything else is a normal code block. */
function Pre({ children, ...rest }: ComponentProps<'pre'>) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const { className = '', children: code } = children.props
    if (className.includes('language-mermaid')) return <Mermaid code={String(code ?? '')} />
  }
  return <pre {...rest}>{children}</pre>
}

/** Labels each cell with its column header so wide tables can stack on phones. */
function Table(props: ComponentProps<'table'>) {
  const wrap = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const headers = [...el.querySelectorAll('thead th')].map((th) => th.textContent ?? '')
    el.dataset.stack = String(headers.length >= 3)
    el.querySelectorAll('tbody tr').forEach((tr) => {
      ;[...tr.children].forEach((td, i) => td.setAttribute('data-label', headers[i] ?? ''))
    })
  }, [])
  return (
    <div ref={wrap} className="table-wrap">
      <table {...props} />
    </div>
  )
}

export const mdxComponents: MDXComponents = {
  a: Anchor,
  pre: Pre,
  table: Table,
  Callout,
}
