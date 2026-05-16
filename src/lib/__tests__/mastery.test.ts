import { describe, it, expect } from 'vitest'
import { consecutiveCorrect, isMastered } from '../mastery'
import type { Attempt } from '@/types'

function attempt(date: number, correct: boolean): Attempt {
  return { id: String(date), wordId: 'w1', date, correct }
}

describe('consecutiveCorrect', () => {
  it('returns 0 for empty attempts', () => {
    expect(consecutiveCorrect([])).toBe(0)
  })

  it('returns 0 when most recent attempt is wrong', () => {
    const attempts = [attempt(1, true), attempt(2, true), attempt(3, false)]
    expect(consecutiveCorrect(attempts)).toBe(0)
  })

  it('counts trailing correct streak from most recent', () => {
    const attempts = [attempt(1, false), attempt(2, true), attempt(3, true)]
    expect(consecutiveCorrect(attempts)).toBe(2)
  })

  it('handles all correct', () => {
    const attempts = [attempt(1, true), attempt(2, true), attempt(3, true)]
    expect(consecutiveCorrect(attempts)).toBe(3)
  })

  it('handles all wrong', () => {
    const attempts = [attempt(1, false), attempt(2, false)]
    expect(consecutiveCorrect(attempts)).toBe(0)
  })

  it('sorts by date descending regardless of input order', () => {
    // Give newest first in input — should still work
    const attempts = [attempt(3, true), attempt(1, false), attempt(2, true)]
    expect(consecutiveCorrect(attempts)).toBe(2)
  })

  it('returns 1 for a single correct attempt', () => {
    expect(consecutiveCorrect([attempt(1, true)])).toBe(1)
  })
})

describe('isMastered', () => {
  it('returns false for empty attempts', () => {
    expect(isMastered([])).toBe(false)
  })

  it('returns false when streak < 3', () => {
    const attempts = [attempt(1, true), attempt(2, true)]
    expect(isMastered(attempts)).toBe(false)
  })

  it('returns true when streak === 3', () => {
    const attempts = [attempt(1, true), attempt(2, true), attempt(3, true)]
    expect(isMastered(attempts)).toBe(true)
  })

  it('returns true when streak > 3', () => {
    const attempts = [attempt(1, true), attempt(2, true), attempt(3, true), attempt(4, true)]
    expect(isMastered(attempts)).toBe(true)
  })

  it('returns false when streak broken by wrong answer', () => {
    const attempts = [attempt(1, true), attempt(2, true), attempt(3, false), attempt(4, true), attempt(5, true)]
    expect(isMastered(attempts)).toBe(false)
  })
})
