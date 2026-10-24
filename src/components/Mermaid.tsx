import { useEffect, useId, useState } from 'react'
import { ExpandIcon, CloseIcon } from './Icons'
import styles from './Mermaid.module.css'

type MermaidApi = typeof import('mermaid').default
let mermaidPromise: Promise<MermaidApi> | undefined

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Mermaid is large, so it loads only on pages that contain a diagram, and is
// re-themed from the CSS tokens each time it renders.
async function renderSvg(id: string, code: string): Promise<string> {
  mermaidPromise ??= import('mermaid').then((m) => m.default)
  const mermaid = await mermaidPromise
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: token('--font-sans'),
    themeVariables: {
      background: token('--bg'),
      primaryColor: token('--surface'),
      primaryBorderColor: token('--accent-soft'),
      primaryTextColor: token('--text'),
      secondaryColor: token('--accent-tint'),
      tertiaryColor: token('--surface-raised'),
      lineColor: token('--text-muted'),
      textColor: token('--text'),
      noteBkgColor: token('--accent-tint'),
      noteTextColor: token('--text'),
      noteBorderColor: token('--accent-soft'),
      actorBkg: token('--surface'),
      actorBorder: token('--accent-soft'),
      signalColor: token('--text'),
      signalTextColor: token('--text'),
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
    renderSvg(id, code.trim()).then(
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
