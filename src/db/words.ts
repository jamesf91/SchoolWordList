import type { SpellingIDB } from './schema'
import type { Word } from '@/types'
import { STORE_WORDS } from '@/constants/db'

export async function getWordsByWeek(db: SpellingIDB, weekId: string): Promise<Word[]> {
  return db.getAllFromIndex(STORE_WORDS, 'by-weekId', weekId)
}

export async function getAllWords(db: SpellingIDB): Promise<Word[]> {
  return db.getAll(STORE_WORDS)
}

export async function upsertWord(db: SpellingIDB, word: Word): Promise<void> {
  await db.put(STORE_WORDS, word)
}

export async function deleteWord(db: SpellingIDB, id: string): Promise<void> {
  await db.delete(STORE_WORDS, id)
}
