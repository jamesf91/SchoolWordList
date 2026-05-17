import { STORE_EXAMPLES } from '@/constants/db'
import type { SpellingIDB } from './schema'

export async function getExample(db: SpellingIDB, wordId: string): Promise<string | null> {
  const record = await db.get(STORE_EXAMPLES, wordId)
  return record?.sentence ?? null
}

export async function setExample(db: SpellingIDB, wordId: string, sentence: string): Promise<void> {
  await db.put(STORE_EXAMPLES, { wordId, sentence })
}
