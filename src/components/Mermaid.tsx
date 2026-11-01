import { useEffect, useId, useState } from 'react'
import { ExpandIcon, CloseIcon } from './Icons'
import styles from './Mermaid.module.css'

type MermaidApi = typeof import('mermaid').default
let mermaidPromise: Promise<MermaidApi> | undefined

// Light-theme values, used if a token can't be read as a plain colour (Mermaid
// throws "Unsupported color format" on anything else, including "").
const FALLBACK: Record<string, string> = {
  '--bg': '#faf7f2',
  '--surface': '#f3eee6',
  '--surface-raised': '#fffdf9',
  '--text': '#2a2a2a',
  '--text-muted': '#6b6660',
  '--accent-soft': '#8a9a7e',
  '--accent-tint': '#e8ede3',
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function color(name: string): string {
  const value = token(name)
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : FALLBACK[name]
}

// Mermaid's configuration is global, so renders run one at a time.
let queue: Promise<unknown> = Promise.resolve()

// Mermaid is large, so it loads only on pages that contain a diagram, and is
// re-themed from the CSS tokens each time it renders.
function renderSvg(id: string, code: string): Promise<string> {
  const run = queue.then(() => renderNow(id, code))
  queue = run.catch(() => undefined)
  return run
}

async function renderNow(id: string, code: string): Promise<string> {
  mermaidPromise ??= import('mermaid').then((m) => m.default)
  const mermaid = await mermaidPromise
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: token('--font-sans'),
    themeVariables: {
      background: color('--bg'),
      primaryColor: color('--surface'),
      primaryBorderColor: color('--accent-soft'),
      primaryTextColor: color('--text'),
      secondaryColor: color('--accent-tint'),
      tertiaryColor: color('--surface-raised'),
      lineColor: color('--text-muted'),
      textColor: color('--text'),
      noteBkgColor: color('--accent-tint'),
      noteTextColor: color('--text'),
      noteBorderColor: color('--accent-soft'),
      actorBkg: color('--surface'),
      actorBorder: color('--accent-soft'),
      signalColor: color('--text'),
      signalTextColor: color('--text'),
      fontSize: '15px',
    },
  })
  const { svg } = await mermaid.render(id, code)
  return svg
}

export function Mermaid({ code }: { code: string }) {
  const rawId = useId()
  const [svg, setSvg] = useState<string>()
  const [error, setError] = useState<string>()
  const [expanded, setExpanded] = useState(false)
  const [themeTick, setThemeTick] = useState(0)

  useEffect(() => {
    const bump = () => setThemeTick((t) => t + 1)
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    window.addEventListener('sdg:themechange', bump)
    m.addEventListener('change', bump)
    return () => {
      window.removeEventListener('sdg:themechange', bump)
      m.removeEventListener('change', bump)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const id = `mmd-${rawId.replace(/[^a-zA-Z0-9]/g, '')}-${themeTick}`
    setError(undefined)
    // One retry covers a transient failure, e.g. styles changing mid-render.
    renderSvg(id, code.trim())
      .catch(() => renderSvg(`${id}r`, code.trim()))
      .then(
        (out) => !cancelled && setSvg(out),
        (e: Error) => !cancelled && setError(e.message),
      )
    return () => {
      cancelled = true
    }
  }, [code, rawId, themeTick])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [expanded])

  if (error) {
    return (
      <pre className={styles.error}>
        Diagram failed to render: {error}
        {'\n\n'}
        {code}
      </pre>
    )
  }

  return (
    <figure className={styles.figure}>
      {svg ? (
        <>
          <div className={styles.canvas} dangerouslySetInnerHTML={{ __html: svg }} />
          <button type="button" className={styles.expand} onClick={() => setExpanded(true)} aria-label="View diagram full screen">
            <ExpandIcon width={18} height={18} />
          </button>
        </>
      ) : (
        <div className={styles.placeholder}>Loading diagram…</div>
      )}
      {expanded && svg && (
        <div className={styles.fullscreen} role="dialog" aria-modal="true" aria-label="Diagram">
          <button type="button" className={styles.closeFull} onClick={() => setExpanded(false)} aria-label="Close diagram">
            <CloseIcon />
          </button>
          <div className={styles.fullCanvas} dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      )}
    </figure>
  )
}
