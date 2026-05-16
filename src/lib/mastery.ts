import type { Attempt } from '@/types'
import { MASTERY_THRESHOLD } from '@/constants/config'

export function consecutiveCorrect(attempts: Attempt[]): number {
  const sorted = [...attempts].sort((a, b) => b.date - a.date)
  let count = 0
  for (const attempt of sorted) {
    if (!attempt.correct) break
    count++
  }
  return count
}

export function isMastered(attempts: Attempt[]): boolean {
  return consecutiveCorrect(attempts) >= MASTERY_THRESHOLD
}
