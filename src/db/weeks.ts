import type { SpellingIDB } from './schema'
import type { Week } from '@/types'
import { STORE_WEEKS } from '@/constants/db'

export async function getAllWeeks(db: SpellingIDB): Promise<Week[]> {
  return db.getAll(STORE_WEEKS)
}

export async function getWeek(db: SpellingIDB, id: string): Promise<Week | undefined> {
  return db.get(STORE_WEEKS, id)
}

export async function upsertWeek(db: SpellingIDB, week: Week): Promise<void> {
  await db.put(STORE_WEEKS, week)
}

export async function deleteWeek(db: SpellingIDB, id: string): Promise<void> {
  await db.delete(STORE_WEEKS, id)
}
