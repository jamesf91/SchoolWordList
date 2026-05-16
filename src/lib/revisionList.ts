import type { Word, Week, Attempt } from '@/types'
import { isMastered } from './mastery'

export interface RevisionInput {
  allWords: Word[]
  allWeeks: Week[]
  allAttempts: Attempt[]
  lastSessionWordIds: string[]
  currentDate: number
  sessionSize?: number
}

const DEFAULT_SESSION_SIZE = 10
const CURRENT_WEEK_SLOTS = 4
const PREV_WEEK_SLOTS = 3
const STRUGGLING_SLOTS = 3
const MS_PER_HOUR = 60 * 60 * 1000
const RECENT_CUTOFF_HOURS = 24

/** Day-of-week derived from a timestamp: 1 = Monday … 7 = Sunday */
function dayOfWeek(ts: number): number {
  const d = new Date(ts).getDay() // 0=Sun,1=Mon,...,6=Sat
  return d === 0 ? 7 : d
}

function attemptsForWord(wordId: string, allAttempts: Attempt[]): Attempt[] {
  return allAttempts.filter(a => a.wordId === wordId)
}

function mostRecentAttemptDate(wordId: string, allAttempts: Attempt[]): number {
  const dates = allAttempts.filter(a => a.wordId === wordId).map(a => a.date)
  return dates.length ? Math.max(...dates) : 0
}

function seenRecently(wordId: string, allAttempts: Attempt[], currentDate: number): boolean {
  const latest = mostRecentAttemptDate(wordId, allAttempts)
  return latest > 0 && currentDate - latest < RECENT_CUTOFF_HOURS * MS_PER_HOUR
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function pick<T>(pool: T[], n: number): T[] {
  return pool.slice(0, n)
}

export function buildRevisionList(input: RevisionInput): Word[] {
  const {
    allWords,
    allWeeks,
    allAttempts,
    lastSessionWordIds,
    currentDate,
    sessionSize = DEFAULT_SESSION_SIZE,
  } = input

  const lastSessionSet = new Set(lastSessionWordIds)

  // No weeks → nothing to practise
  if (allWeeks.length === 0) return []

  // Identify the current week (most recent by weekNumber)
  const sortedWeeks = [...allWeeks].sort((a, b) => b.weekNumber - a.weekNumber)
  const currentWeek = sortedWeeks[0]
  const currentWeekId = currentWeek?.id ?? null

  const weekIdSet = new Set(allWeeks.map(w => w.id))

  // Words never shown in last session, and belonging to a known week
  const eligible = (word: Word) => !lastSessionSet.has(word.id) && weekIdSet.has(word.weekId)

  // ── Slot 1: current week words ─────────────────────────────────────────────
  const currentWeekWords = allWords.filter(w => w.weekId === currentWeekId && eligible(w))

  // Day-of-week weighting: days 1-3 core-heavy, days 5-7 extension-heavy, mid mixed
  const dow = dayOfWeek(currentDate)
  let currentWeekOrdered: Word[]
  if (dow <= 3) {
    // Core-heavy early in week
    const core = shuffle(currentWeekWords.filter(w => w.category === 'core'))
    const rest = shuffle(currentWeekWords.filter(w => w.category !== 'core'))
    currentWeekOrdered = [...core, ...rest]
  } else if (dow >= 5) {
    // Extension-heavy later in week
    const ext = shuffle(currentWeekWords.filter(w => w.category === 'extension'))
    const rest = shuffle(currentWeekWords.filter(w => w.category !== 'extension'))
    currentWeekOrdered = [...ext, ...rest]
  } else {
    // Mixed mid-week
    currentWeekOrdered = shuffle(currentWeekWords)
  }
  const currentSlot = pick(currentWeekOrdered, CURRENT_WEEK_SLOTS)
  const usedIds = new Set(currentSlot.map(w => w.id))

  // ── Slot 2: previous week words ────────────────────────────────────────────
  const prevWeeksSorted = sortedWeeks.slice(1) // already sorted newest-first
  const prevWeekWordPool: Word[] = []
  for (const week of prevWeeksSorted) {
    const words = allWords.filter(
      w =>
        w.weekId === week.id &&
        eligible(w) &&
        !usedIds.has(w.id) &&
        !seenRecently(w.id, allAttempts, currentDate),
    )
    // Shuffle within each week, then append — newer weeks come first
    prevWeekWordPool.push(...shuffle(words))
  }
  const prevSlot = pick(prevWeekWordPool, PREV_WEEK_SLOTS)
  prevSlot.forEach(w => usedIds.add(w.id))

  // ── Slot 3: struggling words ───────────────────────────────────────────────
  const strugglingPool = allWords
    .filter(w => {
      if (!eligible(w) || usedIds.has(w.id)) return false
      const attempts = attemptsForWord(w.id, allAttempts)
      const wrongCount = attempts.filter(a => !a.correct).length
      return wrongCount >= 2 && !isMastered(attempts)
    })
    .sort((a, b) => {
      // Sort by most-recently-wrong first
      const latestWrong = (word: Word) => {
        const dates = allAttempts
          .filter(a => a.wordId === word.id && !a.correct)
          .map(a => a.date)
        return dates.length ? Math.max(...dates) : 0
      }
      return latestWrong(b) - latestWrong(a)
    })
  const strugglingSlot = pick(strugglingPool, STRUGGLING_SLOTS)
  strugglingSlot.forEach(w => usedIds.add(w.id))

  // ── Assemble & backfill ────────────────────────────────────────────────────
  const assembled = [...currentSlot, ...prevSlot, ...strugglingSlot]

  // Backfill respects the same recent-cutoff rule for non-current-week words
  const backfillEligible = (w: Word) =>
    eligible(w) &&
    !usedIds.has(w.id) &&
    (w.weekId === currentWeekId || !seenRecently(w.id, allAttempts, currentDate))

  const eligibleTotal = allWords.filter(backfillEligible).length + assembled.length
  const shortfall = Math.min(sessionSize, eligibleTotal) - assembled.length

  if (shortfall > 0) {
    const backfillPool = shuffle(allWords.filter(backfillEligible))
    assembled.push(...pick(backfillPool, shortfall))
  }

  return assembled.slice(0, sessionSize)
}
