// Quiz questions shown at the end of each principle and in Quick practice.
// Shared by the app and the build-time content check, so keep it free of
// browser or Node specific imports.

export interface ChoiceQuestion {
  type: 'choice'
  q: string
  options: string[]
  /** Index into options. */
  answer: number
  explain: string
}

export interface NumberQuestion {
  type: 'number'
  q: string
  answer: number
  /** Shown next to the input, e.g. "requests/s" or "TB". */
  unit?: string
  /** Allowed relative error, e.g. 0.2 accepts answers within 20%. Defaults to 0.15. */
  tolerance?: number
  explain: string
}

export type Question = ChoiceQuestion | NumberQuestion

/** Questions keyed by principle slug. */
export type QuizBank = Record<string, Question[]>

export const DEFAULT_TOLERANCE = 0.15
