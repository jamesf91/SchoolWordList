import type { SpellingIDB } from './schema'
import type { Attempt } from '@/types'
import { STORE_ATTEMPTS } from '@/constants/db'

export async function insertAttempt(db: SpellingIDB, attempt: Attempt): Promise<void> {
  await db.add(STORE_ATTEMPTS, attempt)
}

export async function getAttemptsForWord(db: SpellingIDB, wordId: string): Promise<Attempt[]> {
  return db.getAllFromIndex(STORE_ATTEMPTS, 'by-wordId', wordId)
}

export async function getAttemptsAfter(db: SpellingIDB, since: number): Promise<Attempt[]> {
  const range = IDBKeyRange.lowerBound(since, true)
  return db.getAllFromIndex(STORE_ATTEMPTS, 'by-date', range)
}

export async function getAllAttempts(db: SpellingIDB): Promise<Attempt[]> {
  return db.getAll(STORE_ATTEMPTS)
}

/** Returns a map of wordId → Attempt[] for all words that have at least one attempt. */
export async function getRecentAttemptsGroupedByWord(
  db: SpellingIDB,
): Promise<Map<string, Attempt[]>> {
  const all = await db.getAll(STORE_ATTEMPTS)
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
