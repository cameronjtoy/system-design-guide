import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'sdg:theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function current(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return media().matches ? 'dark' : 'light'
}

/** The resolved theme, plus a toggle that pins the opposite choice. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(current)

  useEffect(() => {
    const m = media()
    const onChange = () => setTheme(current())
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      // The inline script in index.html reads this raw value.
      localStorage.setItem(KEY, next)
    } catch {
      // Theme still applies for this visit.
    }
    setTheme(next)
    window.dispatchEvent(new CustomEvent('sdg:themechange'))
  }, [])

  return [theme, toggle]
}
