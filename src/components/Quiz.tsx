import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { QuizBank } from '../content/quizzes/types'
import { formatNumber, isCloseEnough, itemsForPrinciple, loadQuizBank, parseNumber, shuffle, type QuizItem } from '../lib/quiz'
import { recordAnswer } from '../lib/quizStats'
import { CheckIcon } from './Icons'
import styles from './Quiz.module.css'

export interface AnswerResult {
  correct: boolean
}

interface QuestionCardProps {
  item: QuizItem
  /** Shown above the question, e.g. "Question 3 of 10". */
  label?: string
  onAnswered?: (result: AnswerResult) => void
  /** Link to the lesson after answering (Quick practice). */
  lessonLink?: { to: string; title: string }
}

function verdict(type: 'choice' | 'number', result: { correct: boolean; picked?: number; value?: number }) {
  if (result.correct) return type === 'number' ? 'Close enough!' : 'Correct.'
  if (type === 'number' && result.value === undefined) return 'Here’s how to work it out.'
  return 'Not quite.'
}

/** One question with immediate feedback. Remount (via key) to reset. */
export function QuestionCard({ item, label, onAnswered, lessonLink }: QuestionCardProps) {
  const { question } = item
  const [result, setResult] = useState<{ correct: boolean; picked?: number; value?: number } | undefined>()
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')
  const inputId = useId()

  // Show choices in a random order so the answer's position isn't a hint.
  const order = useMemo(
    () => (question.type === 'choice' ? shuffle(question.options.map((_, i) => i)) : []),
    [question],
  )

  const finish = (correct: boolean, extra: { picked?: number; value?: number }) => {
    setResult({ correct, ...extra })
    recordAnswer(item.id, correct)
    onAnswered?.({ correct })
  }

  const submitNumber = (e: FormEvent) => {
    e.preventDefault()
    if (question.type !== 'number' || result) return
    const value = parseNumber(input)
    if (value === undefined) {
      setInputError('Enter a number, like 1200, 1.2k or 3e6.')
      return
    }
    setInputError('')
    finish(isCloseEnough(question, value), { value })
  }

  return (
    <div className={styles.card} data-state={result ? (result.correct ? 'correct' : 'wrong') : 'open'}>
      <div className={styles.cardHead}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.kind}>{question.type === 'choice' ? 'Multiple choice' : 'Math'}</span>
      </div>
      <p className={styles.prompt}>{question.q}</p>

      {question.type === 'choice' ? (
        <div className={styles.options} role="group" aria-label="Answers">
          {order.map((i) => {
            const isAnswer = i === question.answer
            const isPicked = result?.picked === i
            const state = !result ? undefined : isAnswer ? 'answer' : isPicked ? 'picked' : 'other'
            return (
              <button
                key={i}
                type="button"
                className={styles.option}
                data-state={state}
                disabled={!!result}
                aria-pressed={isPicked}
                onClick={() => finish(isAnswer, { picked: i })}
              >
                <span className={styles.optionText}>{question.options[i]}</span>
                {state === 'answer' && <CheckIcon width={16} height={16} aria-label="Correct answer" />}
              </button>
            )
          })}
        </div>
      ) : (
        <form className={styles.numberRow} onSubmit={submitNumber}>
          <label htmlFor={inputId} className="visually-hidden">
            Your answer{question.unit ? ` in ${question.unit}` : ''}
          </label>
          <input
            id={inputId}
            className={styles.input}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Your estimate"
            value={input}
            disabled={!!result}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={!!inputError}
            aria-describedby={inputError ? `${inputId}-err` : undefined}
          />
          {question.unit && <span className={styles.unit}>{question.unit}</span>}
          <button type="submit" className={styles.check} disabled={!!result || input.trim() === ''}>
            Check
          </button>
          {!result && (
            <button type="button" className={styles.reveal} onClick={() => finish(false, {})}>
              Show answer
            </button>
          )}
          {inputError && (
            <p id={`${inputId}-err`} className={styles.inputError} role="alert">
              {inputError}
            </p>
          )}
        </form>
      )}

      {result && (
        <div className={styles.feedback} role="status">
          <p className={styles.verdict}>
            {verdict(question.type, result)}
            {question.type === 'number' && (
              <span className={styles.exact}>
                {' '}
                Answer: ≈ {formatNumber(question.answer)}
                {question.unit ? `${question.unit === '%' ? '' : ' '}${question.unit}` : ''}
                {result.value !== undefined && ` (you said ${formatNumber(result.value)})`}
              </span>
            )}
          </p>
          <p className={styles.explain}>{question.explain}</p>
          {lessonLink && (
            <p className={styles.lessonLink}>
              From <Link to={lessonLink.to}>{lessonLink.title}</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** The "Check yourself" block at the end of a principle. */
export function LessonQuiz({ slug, category }: { slug: string; category: string }) {
  const [bank, setBank] = useState<QuizBank | undefined>()
  const [failed, setFailed] = useState(false)
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    loadQuizBank().then(
      (b) => !cancelled && setBank(b),
      () => !cancelled && setFailed(true),
    )
    return () => {
      cancelled = true
    }
  }, [])

  // Reset when moving to another principle.
  useEffect(() => {
    setAnswers({})
    setRound(0)
  }, [slug])

  if (failed) return <p className={styles.muted}>The quiz couldn’t load. Try reloading the page.</p>
  if (!bank) return <p className={styles.muted}>Loading questions…</p>

  const items = itemsForPrinciple(bank, slug, category)
  if (items.length === 0) return null
  const done = Object.keys(answers).length
  const correct = Object.values(answers).filter(Boolean).length

  return (
    <div className={styles.lesson}>
      <p className={styles.intro}>
        {items.length} quick questions. Math answers within about 15% count, so estimate rather than calculate exactly.
      </p>
      {items.map((item, i) => (
        <QuestionCard
          key={`${round}-${item.id}`}
          item={item}
          label={`${i + 1} of ${items.length}`}
          onAnswered={({ correct }) => setAnswers((a) => ({ ...a, [item.id]: correct }))}
        />
      ))}
      <div className={styles.summary} aria-live="polite">
        {done === items.length ? (
          <>
            <span>
              You got <strong>{correct}</strong> of {items.length}.
            </span>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setAnswers({})
                setRound((r) => r + 1)
              }}
            >
              Try again
            </button>
            <Link to={`/quiz?topic=${category}`} className={styles.secondary}>
              Practice this topic
            </Link>
          </>
        ) : (
          <span className={styles.muted}>
            {done} of {items.length} answered
          </span>
        )}
      </div>
    </div>
  )
}
