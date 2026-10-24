import { useEffect } from 'react'

const SITE = 'System Design Guide'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE
  }, [title])
}
