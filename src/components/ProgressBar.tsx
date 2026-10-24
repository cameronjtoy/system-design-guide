import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  done: number
  total: number
  label: string
  /** Show "3 of 10" beside the bar. */
  showCount?: boolean
}

export function ProgressBar({ done, total, label, showCount = true }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total}`}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {showCount && (
        <span className={styles.count}>
          {done} / {total}
        </span>
      )}
    </div>
  )
}
