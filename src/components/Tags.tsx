import type { ReactNode } from 'react'
import type { Difficulty } from '../content/meta'
import styles from './Tags.module.css'

const LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function DifficultyTag({ level }: { level: Difficulty }) {
  return <span className={`${styles.tag} ${styles[level]}`}>{LABELS[level]}</span>
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className={styles.pill}>{children}</span>
}
