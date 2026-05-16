import type { SpellingIDB } from './schema'
import type { Attempt } from '@/types'
import { STORE_ATTEMPTS } from '@/constants/db'

export async function insertAttempt(db: SpellingIDB, attempt: Attempt): Promise<void> {
  await db.add(STORE_ATTEMPTS, attempt)
}

export async function getAttemptsForWord(
  db: SpellingIDB,
  wordId: string,
  childId: string,
): Promise<Attempt[]> {
  const all = await db.getAllFromIndex(STORE_ATTEMPTS, 'by-childId-wordId', [childId, wordId])
  return all
}

export async function getAttemptsAfter(
  db: SpellingIDB,
  since: number,
  childId: string,
): Promise<Attempt[]> {
  const range = IDBKeyRange.lowerBound(since, true)
  const all = await db.getAllFromIndex(STORE_ATTEMPTS, 'by-date', range)
  return all.filter(a => a.childId === childId)
}

export async function getAllAttempts(db: SpellingIDB, childId: string): Promise<Attempt[]> {
  return db.getAllFromIndex(STORE_ATTEMPTS, 'by-childId', childId)
}

export async function getAttemptsByChild(db: SpellingIDB, childId: string): Promise<Attempt[]> {
  return db.getAllFromIndex(STORE_ATTEMPTS, 'by-childId', childId)
}

/** Returns a map of wordId → Attempt[] for all words that have at least one attempt, for a given child. */
export async function getRecentAttemptsGroupedByWord(
  db: SpellingIDB,
  childId: string,
): Promise<Map<string, Attempt[]>> {
  const all = await getAllAttempts(db, childId)
  const map = new Map<string, Attempt[]>()
  for (const attempt of all) {
    const existing = map.get(attempt.wordId)
    if (existing) {
      existing.push(attempt)
    } else {
      map.set(attempt.wordId, [attempt])
    }
  }
  return map
}
