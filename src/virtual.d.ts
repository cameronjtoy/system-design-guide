declare module 'virtual:content' {
  import type { Entry } from './content/meta'
  const entries: Entry[]
  export default entries
}

declare module 'virtual:search-docs' {
  import type { SearchDoc } from './content/meta'
  const docs: SearchDoc[]
  export default docs
}
