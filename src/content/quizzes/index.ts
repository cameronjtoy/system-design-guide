// All quiz questions, keyed by principle slug. One file per category.
import type { QuizBank } from './types.ts'
import foundations from './foundations.ts'
import scaling from './scaling.ts'
import data from './data.ts'
import caching from './caching.ts'
import distributed from './distributed.ts'
import messaging from './messaging.ts'
import reliability from './reliability.ts'
import security from './security.ts'
import aiInfra from './ai-infra.ts'
import product from './product.ts'
import dataDesign from './data-design.ts'

export const QUIZZES: QuizBank = {
  ...foundations,
  ...scaling,
  ...data,
  ...caching,
  ...distributed,
  ...messaging,
  ...reliability,
  ...security,
  ...aiInfra,
  ...product,
  ...dataDesign,
}
