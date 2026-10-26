import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { CATEGORIES } from '../content/meta'
import type { QuizBank } from '../content/quizzes/types'
import { getPrinciple, entryPath } from '../lib/content'
import { itemsForPrinciple, loadQuizBank, shuffle, type QuizItem } from '../lib/quiz'
import { DRILLS, makeDrill } from '../lib/mathDrills'
import { summarize, useQuizStats } from '../lib/quizStats'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { QuestionCard } from '../components/Quiz'
import { ProgressBar } from '../components/ProgressBar'
import indexStyles from './IndexPage.module.css'
import quizStyles from '../components/Quiz.module.css'
import styles from './QuickPractice.module.css'

type Kind = 'mixed' | 'choice' | 'math'
const KINDS: { id: Kind; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'choice', label: 'Multiple choice' },
  { id: 'math', label: 'Math' },
]
const LENGTHS = [5, 10, 20]

interface Settings {
  topic: string
  kind: Kind
  length: number
  missedOnly: boolean
}

function allBankItems(bank: QuizBank): QuizItem[] {
  return Object.keys(bank).flatMap((slug) => {
    const category = getPrinciple(slug)?.category ?? 'foundations'
    return itemsForPrinciple(bank, slug, category)
  })
}

/** Picks a round of questions for the chosen settings. */
function buildRound(bank: QuizBank, s: Settings, missed: ReadonlySet<string>): QuizItem[] {
  const inTopic = (category: string) => s.topic === '' || category === s.topic
  const drills = DRILLS.filter((d) => inTopic(d.category))
  const fresh = (n: number) =>
    drills.length ? Array.from({ length: n }, () => makeDrill(drills[Math.floor(Math.random() * drills.length)])) : []

  let pool = allBankItems(bank).filter((it) => inTopic(it.category))
  if (s.kind === 'choice') pool = pool.filter((it) => it.question.type === 'choice')
  if (s.kind === 'math') pool = pool.filter((it) => it.question.type === 'number')

  if (s.missedOnly) {
    const bankMissed = pool.filter((it) => missed.has(it.id))
    const drillMissed =
      s.kind === 'choice' ? [] : drills.filter((d) => missed.has(`gen:${d.kind}`)).map((d) => makeDrill(d))
    return shuffle([...bankMissed, ...drillMissed]).slice(0, s.length)
  }

  if (s.kind === 'math') {
    // Half from lessons, the rest freshly generated drills.
    const fromBank = shuffle(pool).slice(0, Math.ceil(s.length / 2))
    return shuffle([...fromBank, ...fresh(s.length - fromBank.length)])
  }
  if (s.kind === 'mixed') {
    const drillCount = drills.length ? Math.max(1, Math.round(s.length * 0.2)) : 0
    const fromBank = shuffle(pool).slice(0, s.length - drillCount)
    return shuffle([...fromBank, ...fresh(s.length - fromBank.length)])
  }
  return shuffle(pool).slice(0, s.length)
}

function lessonFor(item: QuizItem) {
  const p = item.slug ? getPrinciple(item.slug) : undefined
  return p ? { to: entryPath(p), title: p.title } : undefined
}

/** Remount on every navigation so following a Quick practice link starts fresh. */
export function QuickPractice() {
  const { key, search } = useLocation()
  // Hash changes typed into the address bar all get the key "default", so the
  // query string is part of the key too.
  return <QuickPracticePage key={`${key}${search}`} />
}

function QuickPracticePage() {
  useDocumentTitle('Quick practice')
  const [params] = useSearchParams()
  const stats = useQuizStats()
  const [bank, setBank] = useState<QuizBank | undefined>()
  const [loadError, setLoadError] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => ({
    topic: CATEGORIES.some((c) => c.id === params.get('topic')) ? params.get('topic')! : '',
    kind: KINDS.some((k) => k.id === params.get('type')) ? (params.get('type') as Kind) : 'mixed',
    length: 10,
    missedOnly: params.get('mode') === 'missed',
  }))
  const [round, setRound] = useState<{ items: QuizItem[]; index: number; results: boolean[]; key: number }>()

  useEffect(() => {
    loadQuizBank().then(setBank, () => setLoadError(true))
  }, [])

  const missed = new Set(Object.entries(stats).filter(([, s]) => !s.last).map(([id]) => id))
  const totals = summarize(stats)

  const start = (override?: Partial<Settings>) => {
    if (!bank) return
    const s = { ...settings, ...override }
    setSettings(s)
    setRound({ items: buildRound(bank, s, missed), index: 0, results: [], key: Date.now() })
    window.scrollTo({ top: 0 })
  }

  const topics = CATEGORIES.filter(
    (c) => (bank && Object.keys(bank).some((slug) => getPrinciple(slug)?.category === c.id)) || DRILLS.some((d) => d.category === c.id),
  )

  // --- Playing a round -----------------------------------------------------
  if (round && round.items.length > 0) {
    const { items, index, results } = round
    const answeredCurrent = results.length > index

    // "See results" moves the index one past the last question.
    if (index >= items.length) {
      const score = results.filter(Boolean).length
      const wrong = items.filter((_, i) => !results[i])
      return (
        <div className={styles.page}>
          <header className={indexStyles.header}>
            <h1>Round complete</h1>
            <p>
              You got <strong>{score}</strong> of {items.length} right.
            </p>
          </header>
          <ProgressBar done={score} total={items.length} label="Score" />
          <div className={styles.actions}>
            <button type="button" className={quizStyles.primary} onClick={() => start({ missedOnly: false })}>
              New round
            </button>
            <button type="button" className={quizStyles.secondary} onClick={() => setRound(undefined)}>
              Change settings
            </button>
          </div>
          {wrong.length > 0 && (
            <section className={indexStyles.section}>
              <h2>Review what you missed</h2>
              <ul className={styles.missedList}>
                {wrong.map((it, i) => {
                  const lesson = lessonFor(it)
                  return (
                    <li key={`${it.id}-${i}`}>
                      <span>{it.question.q}</span>
                      {lesson && <Link to={lesson.to}>{lesson.title}</Link>}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )
    }

    const item = items[index]
    return (
      <div className={styles.page}>
        <div className={styles.roundHead}>
          <button type="button" className={styles.quit} onClick={() => setRound(undefined)}>
            End round
          </button>
          <ProgressBar done={results.length} total={items.length} label="Round progress" />
        </div>
        <QuestionCard
          key={`${round.key}-${index}`}
          item={item}
          label={`Question ${index + 1} of ${items.length}`}
          lessonLink={lessonFor(item)}
          onAnswered={({ correct }) => setRound((r) => r && { ...r, results: [...r.results, correct] })}
        />
        <div className={styles.actions}>
          <button
            type="button"
            className={quizStyles.primary}
            disabled={!answeredCurrent}
            onClick={() => {
              setRound((r) => r && { ...r, index: r.index + 1 })
              window.scrollTo({ top: 0 })
            }}
          >
            {index === items.length - 1 ? 'See results' : 'Next question'}
          </button>
        </div>
      </div>
    )
  }

  // --- Setup ---------------------------------------------------------------
  const emptyRound = round && round.items.length === 0
  return (
    <div className={styles.page}>
      <header className={indexStyles.header}>
        <h1>Quick practice</h1>
        <p>
          Short rounds of multiple-choice and estimation questions drawn from every lesson. Math questions use fresh
          numbers each time, and answers within about 15% count.
        </p>
      </header>

      {totals.answered > 0 && (
        <p className={styles.stats}>
          You’ve answered {totals.answered} questions, {Math.round((totals.correct / totals.answered) * 100)}% correct.
          {missed.size > 0 && (
            <>
              {' '}
              <button type="button" className={styles.linkButton} onClick={() => start({ missedOnly: true, topic: '', kind: 'mixed' })} disabled={!bank}>
                Retry the {missed.size} you last got wrong
              </button>
            </>
          )}
        </p>
      )}

      <div className={styles.setup}>
        <fieldset className={styles.field}>
          <legend>Topic</legend>
          <div className={indexStyles.chips} role="group" aria-label="Topic">
            <button type="button" className={indexStyles.chip} aria-pressed={settings.topic === ''} onClick={() => setSettings((s) => ({ ...s, topic: '' }))}>
              All topics
            </button>
            {topics.map((c) => (
              <button
                key={c.id}
                type="button"
                className={indexStyles.chip}
                aria-pressed={settings.topic === c.id}
                onClick={() => setSettings((s) => ({ ...s, topic: c.id }))}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend>Question type</legend>
          <div className={indexStyles.chips} role="group" aria-label="Question type">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                className={indexStyles.chip}
                aria-pressed={settings.kind === k.id}
                onClick={() => setSettings((s) => ({ ...s, kind: k.id }))}
              >
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend>Length</legend>
          <div className={indexStyles.chips} role="group" aria-label="Length">
            {LENGTHS.map((n) => (
              <button
                key={n}
                type="button"
                className={indexStyles.chip}
                aria-pressed={settings.length === n}
                onClick={() => setSettings((s) => ({ ...s, length: n }))}
              >
                {n} questions
              </button>
            ))}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <button type="button" className={quizStyles.primary} disabled={!bank} onClick={() => start({ missedOnly: false })}>
            {bank ? 'Start round' : loadError ? 'Couldn’t load questions' : 'Loading questions…'}
          </button>
        </div>
        {emptyRound && <p className={styles.stats}>No questions match those settings yet. Try another topic or type.</p>}
      </div>

      <section className={indexStyles.section}>
        <h2>Math drills</h2>
        <p className={indexStyles.sectionLead}>
          Each drill generates a new problem every time. Choose Math above to practice them, or read the lesson behind
          each one.
        </p>
        <ul className={styles.drills}>
          {DRILLS.map((d) => {
            const p = getPrinciple(d.slug)
            const s = stats[`gen:${d.kind}`]
            return (
              <li key={d.kind}>
                <span className={styles.drillName}>{d.label}</span>
                {p && <Link to={entryPath(p)}>{p.title}</Link>}
                {s && (
                  <span className={styles.drillStat}>
                    {s.c}/{s.n} correct
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
