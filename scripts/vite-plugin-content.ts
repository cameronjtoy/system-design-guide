// Exposes the content manifest to the app as two virtual modules:
//   virtual:content      entry metadata, imported eagerly by the app shell
//   virtual:search-docs  plain-text search documents, loaded when search opens
// MDX bodies themselves are lazy-loaded per page via import.meta.glob.

import type { Plugin, ViteDevServer } from 'vite'
import { loadContent } from './content-core.ts'

const MODULES = {
  'virtual:content': 'entries',
  'virtual:search-docs': 'searchDocs',
} as const
type VirtualId = keyof typeof MODULES
const RESOLVED_PREFIX = '\0'

export function contentPlugin(): Plugin {
  let root = process.cwd()
  let server: ViteDevServer | undefined

  return {
    name: 'sdg-content',
    configResolved(config) {
      root = config.root
    },
    configureServer(s) {
      server = s
      const reload = (file: string) => {
        if (!file.endsWith('.mdx')) return
        for (const id of Object.keys(MODULES)) {
          const mod = s.moduleGraph.getModuleById(RESOLVED_PREFIX + id)
          if (mod) s.moduleGraph.invalidateModule(mod)
        }
        s.ws.send({ type: 'full-reload' })
      }
      s.watcher.on('add', reload)
      s.watcher.on('unlink', reload)
      s.watcher.on('change', reload)
    },
    resolveId(id) {
      if (id in MODULES) return RESOLVED_PREFIX + id
    },
    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return
      const name = id.slice(RESOLVED_PREFIX.length) as VirtualId
      if (!(name in MODULES)) return
      const result = loadContent(root)
      const errors = result.problems.filter((p) => p.level === 'error')
      if (errors.length > 0) {
        const message = errors.map((p) => `${p.file}: ${p.message}`).join('\n')
        if (server) this.warn(message)
        else this.error(`Invalid content:\n${message}`)
      }
      const data = result[MODULES[name]]
      return `export default ${JSON.stringify(data)}`
    },
  }
}
