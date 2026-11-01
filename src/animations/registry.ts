import type { Scene } from './types'

// Each scene file in ./scenes exports a default Scene and is named after the
// principle it illustrates. Scenes load on demand.
const loaders = import.meta.glob<{ default: Scene }>('./scenes/*.ts')

const byName = new Map(
  Object.entries(loaders).map(([path, load]) => [path.replace(/^\.\/scenes\/|\.ts$/g, ''), load]),
)

/** Names of every scene, which are also principle slugs. */
export const SCENE_NAMES = [...byName.keys()].sort()

export function loadScene(name: string): Promise<Scene> {
  const load = byName.get(name)
  if (!load) return Promise.reject(new Error(`Unknown animation "${name}"`))
  return load().then((m) => m.default)
}
