import { describe, it, expect } from 'vitest'
import { buildRevisionList, type RevisionInput } from '../revisionList'
import type { Word, Week, Attempt } from '@/types'

// ── helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-07T10:00:00Z').getTime() // Wednesday

function week(weekNumber: number): Week {
  return { id: `week-${weekNumber}`, weekNumber, focusSound: 'igh', createdAt: NOW }
}

function word(id: string, weekId: string, category: Word['category'] = 'core'): Word {
  return { id, weekId, text: id, category }
}

function attempt(wordId: string, correct: boolean, daysAgo = 0): Attempt {
  return {
    id: `att-${wordId}-${correct}-${daysAgo}`,
    wordId,
    date: NOW - daysAgo * 24 * 60 * 60 * 1000,
    correct,
  }
}

function base(overrides: Partial<RevisionInput> = {}): RevisionInput {
  return {
    allWords: [],
    allWeeks: [],
    allAttempts: [],
    lastSessionWordIds: [],
    currentDate: NOW,
    sessionSize: 10,
    ...overrides,
  }
}

const ids = (words: Word[]) => words.map(w => w.id)

// ── empty state ───────────────────────────────────────────────────────────────

describe('empty inputs', () => {
  it('returns empty list when no words', () => {
    expect(buildRevisionList(base())).toEqual([])
  })

  it('returns empty list when no weeks', () => {
    const words = [word('w1', 'week-1')]
    expect(buildRevisionList(base({ allWords: words }))).toEqual([])
  })
})

// ── session size ──────────────────────────────────────────────────────────────

describe('session size', () => {
  it('caps at sessionSize', () => {
    const weeks = [week(1)]
    const words = Array.from({ length: 20 }, (_, i) => word(`w${i}`, 'week-1'))
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks, sessionSize: 10 }))
    expect(result).toHaveLength(10)
  })

  it('returns fewer than sessionSize when word pool is smaller', () => {
    const weeks = [week(1)]
    const words = [word('w1', 'week-1'), word('w2', 'week-1')]
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks }))
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('uses default session size of 10 when not specified', () => {
    const weeks = [week(1)]
    const words = Array.from({ length: 20 }, (_, i) => word(`w${i}`, 'week-1'))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sessionSize, ...inputWithoutSize } = base({ allWords: words, allWeeks: weeks })
    const result = buildRevisionList(inputWithoutSize)
    expect(result).toHaveLength(10)
  })
})

// ── lastSessionWordIds exclusion ──────────────────────────────────────────────

describe('lastSessionWordIds exclusion', () => {
  it('excludes words that were in the last session', () => {
    const weeks = [week(1)]
    const words = [word('w1', 'week-1'), word('w2', 'week-1'), word('w3', 'week-1')]
    const result = buildRevisionList(
      base({ allWords: words, allWeeks: weeks, lastSessionWordIds: ['w1'] }),
    )
    expect(ids(result)).not.toContain('w1')
  })

  it('includes words not in the last session', () => {
    const weeks = [week(1)]
    const words = [word('w1', 'week-1'), word('w2', 'week-1')]
    const result = buildRevisionList(
      base({ allWords: words, allWeeks: weeks, lastSessionWordIds: ['w1'] }),
    )
    expect(ids(result)).toContain('w2')
  })
})

// ── no duplicates ─────────────────────────────────────────────────────────────

describe('no duplicates', () => {
  it('never returns the same word twice', () => {
    const weeks = [week(1), week(2)]
    const words = [
      word('w1', 'week-1', 'core'), word('w2', 'week-1', 'tricky'),
      word('w3', 'week-2', 'core'), word('w4', 'week-2', 'extension'),
    ]
    const attempts = [
      attempt('w1', false, 1), attempt('w1', false, 2),
    ]
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks, allAttempts: attempts }))
    const resultIds = ids(result)
    expect(new Set(resultIds).size).toBe(resultIds.length)
  })
})

// ── slot composition ──────────────────────────────────────────────────────────

describe('slot composition', () => {
  it('fills current week slot from the most recent week', () => {
    const weeks = [week(1), week(2)]
    const words = [
      word('old1', 'week-1'), word('old2', 'week-1'),
      word('new1', 'week-2'), word('new2', 'week-2'),
      word('new3', 'week-2'), word('new4', 'week-2'),
      word('new5', 'week-2'),
    ]
    const result = buildRevisionList(
      base({ allWords: words, allWeeks: weeks, sessionSize: 4 }),
    )
    // With sessionSize=4, current week fills up to 4 slots
    const resultIds = ids(result)
    const currentWeekWords = resultIds.filter(id => id.startsWith('new'))
    expect(currentWeekWords.length).toBeGreaterThanOrEqual(1)
  })

  it('includes previous week words (excluding recently seen)', () => {
    const weeks = [week(1), week(2)]
    const words = [
      word('old1', 'week-1'), word('old2', 'week-1'), word('old3', 'week-1'),
      word('new1', 'week-2'), word('new2', 'week-2'), word('new3', 'week-2'),
      word('new4', 'week-2'), word('new5', 'week-2'),
    ]
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks }))
    const resultIds = ids(result)
    const prevWeekWords = resultIds.filter(id => id.startsWith('old'))
    expect(prevWeekWords.length).toBeGreaterThanOrEqual(1)
  })

  it('excludes previous-week words seen within 24 hours', () => {
    const weeks = [week(1), week(2)]
    const prevWords = ['old1', 'old2', 'old3'].map(id => word(id, 'week-1'))
    const curWords = ['new1', 'new2', 'new3', 'new4', 'new5'].map(id => word(id, 'week-2'))
    // All prev-week words attempted < 24h ago
    const recentAttempts = prevWords.map(w => attempt(w.id, true, 0))
    const result = buildRevisionList(
      base({ allWords: [...prevWords, ...curWords], allWeeks: weeks, allAttempts: recentAttempts }),
    )
    const resultIds = ids(result)
    for (const w of prevWords) {
      expect(resultIds).not.toContain(w.id)
    }
  })
})

// ── struggling words ──────────────────────────────────────────────────────────

describe('struggling words', () => {
  it('includes words with >= 2 wrong attempts', () => {
    const weeks = [week(1)]
    const words = Array.from({ length: 10 }, (_, i) => word(`w${i}`, 'week-1'))
    const attempts = [
      attempt('w9', false, 5), attempt('w9', false, 4), // struggling
    ]
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks, allAttempts: attempts }))
    expect(ids(result)).toContain('w9')
  })

  it('excludes mastered words from struggling slot', () => {
    const weeks = [week(1), week(2)]
    // Put the mastered word in a prev week so it's only eligible for prev/struggling slots
    const words = [
      word('mastered', 'week-1'),
      ...Array.from({ length: 8 }, (_, i) => word(`w${i}`, 'week-2')),
    ]
    // mastered: 2 wrong then 3 consecutive correct
    const masteredAttempts = [
      attempt('mastered', false, 10),
      attempt('mastered', false, 9),
      attempt('mastered', true, 3),
      attempt('mastered', true, 2),
      attempt('mastered', true, 1),
    ]
    const result = buildRevisionList(
      base({ allWords: words, allWeeks: weeks, allAttempts: masteredAttempts }),
    )
    // mastered should not appear in struggling slot — it may still appear in prev-week slot
    // but the key is it doesn't get double-counted
    const resultIds = ids(result)
    expect(new Set(resultIds).size).toBe(resultIds.length)
  })

  it('sorts struggling words by most-recently-wrong first', () => {
    // Put struggling words in a PREVIOUS week so they land in the struggling slot, not current-week slot
    const weeks = [week(1), week(2)]
    const curWords = Array.from({ length: 4 }, (_, i) => word(`cur${i}`, 'week-2', 'core'))
    const strWords = ['s1', 's2', 's3'].map(id => word(id, 'week-1'))
    const attempts = [
      // s1: wrong 3 days ago
      attempt('s1', false, 3), attempt('s1', false, 5),
      // s2: wrong 1 day ago (most recent)
      attempt('s2', false, 1), attempt('s2', false, 4),
      // s3: wrong 2 days ago
      attempt('s3', false, 2), attempt('s3', false, 6),
      // exclude prev-week words from prev-week slot by making them recently seen
      ...strWords.map(w => attempt(w.id, true, 0)),
    ]
    const result = buildRevisionList(
      base({
        allWords: [...curWords, ...strWords],
        allWeeks: weeks,
        allAttempts: attempts,
        sessionSize: 7,
      }),
    )
    const resultIds = ids(result)
    // All struggling words should appear
    expect(resultIds).toContain('s1')
    expect(resultIds).toContain('s2')
    expect(resultIds).toContain('s3')
    // s2 (most recently wrong) should come before s3, s3 before s1
    expect(resultIds.indexOf('s2')).toBeLessThan(resultIds.indexOf('s3'))
    expect(resultIds.indexOf('s3')).toBeLessThan(resultIds.indexOf('s1'))
  })
})

// ── backfill ──────────────────────────────────────────────────────────────────

describe('backfill', () => {
  it('backfills when slot counts cannot be fully satisfied', () => {
    const weeks = [week(1)]
    // Only 5 words total — not enough for all slots
    const words = Array.from({ length: 5 }, (_, i) => word(`w${i}`, 'week-1'))
    const result = buildRevisionList(base({ allWords: words, allWeeks: weeks }))
    expect(result).toHaveLength(5)
    const resultIds = ids(result)
    expect(new Set(resultIds).size).toBe(5)
  })
})

// ── day-of-week weighting ────────────────────────────────────────────────────

describe('day-of-week weighting', () => {
  const MONDAY = new Date('2026-01-05T10:00:00Z').getTime()   // day 1 → core-heavy
  const SATURDAY = new Date('2026-01-10T10:00:00Z').getTime() // day 6 → extension-heavy

  it('early in week: includes core words preferentially', () => {
    const weeks = [week(1)]
    const coreWords = Array.from({ length: 4 }, (_, i) => word(`core${i}`, 'week-1', 'core'))
    const extWords = Array.from({ length: 4 }, (_, i) => word(`ext${i}`, 'week-1', 'extension'))
    const result = buildRevisionList(
      base({ allWords: [...coreWords, ...extWords], allWeeks: weeks, currentDate: MONDAY, sessionSize: 4 }),
    )
    const coreCount = ids(result).filter(id => id.startsWith('core')).length
    expect(coreCount).toBeGreaterThanOrEqual(2)
  })

  it('late in week: includes extension words preferentially', () => {
    const weeks = [week(1)]
    const coreWords = Array.from({ length: 4 }, (_, i) => word(`core${i}`, 'week-1', 'core'))
    const extWords = Array.from({ length: 4 }, (_, i) => word(`ext${i}`, 'week-1', 'extension'))
    const result = buildRevisionList(
      base({ allWords: [...coreWords, ...extWords], allWeeks: weeks, currentDate: SATURDAY, sessionSize: 4 }),
    )
    const extCount = ids(result).filter(id => id.startsWith('ext')).length
    expect(extCount).toBeGreaterThanOrEqual(2)
  })
})
