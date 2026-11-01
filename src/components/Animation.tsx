import { lazy, Suspense, useEffect, useState } from 'react'
import type { Scene } from '../animations/types'
import { loadScene } from '../animations/registry'
import styles from './Animation.module.css'

const AnimationPlayer = lazy(() => import('./AnimationPlayer'))

/** An animated, step-by-step diagram. Used in MDX as <Animation name="load-balancing" />. */
export function Animation({ name }: { name: string }) {
  const [scene, setScene] = useState<Scene>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setScene(undefined)
    setFailed(false)
    loadScene(name).then(
      (s) => !cancelled && setScene(s),
      () => !cancelled && setFailed(true),
    )
    return () => {
      cancelled = true
    }
  }, [name])

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>
        <span className={styles.badge}>Animation</span>
        {scene?.title ?? 'See it in action'}
      </figcaption>
      {failed ? (
        <p className={styles.placeholder}>This animation couldn’t load. Try reloading the page.</p>
      ) : scene ? (
        <Suspense fallback={<div className={styles.placeholder}>Loading animation…</div>}>
          <AnimationPlayer scene={scene} />
        </Suspense>
      ) : (
        <div className={styles.placeholder}>Loading animation…</div>
      )}
    </figure>
  )
}
