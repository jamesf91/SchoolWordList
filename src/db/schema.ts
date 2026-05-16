import { openDB as idbOpenDB, type IDBPDatabase } from 'idb'
import type { Week, Word, Attempt } from '@/types'
import { DB_NAME, DB_VERSION, STORE_WEEKS, STORE_WORDS, STORE_ATTEMPTS } from '@/constants/db'

interface SpellingDB {
  [STORE_WEEKS]: {
    key: string
    value: Week
    indexes: { 'by-weekNumber': number }
  }
  [STORE_WORDS]: {
    key: string
    value: Word
    indexes: { 'by-weekId': string }
  }
  [STORE_ATTEMPTS]: {
    key: string
    value: Attempt
    indexes: {
      'by-wordId': string
      'by-date': number
      'by-wordId-date': [string, number]
    }
  }
}

export type SpellingIDB = IDBPDatabase<SpellingDB>

export const dbPromise: Promise<SpellingIDB> = idbOpenDB<SpellingDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const weeks = db.createObjectStore(STORE_WEEKS, { keyPath: 'id' })
    weeks.createIndex('by-weekNumber', 'weekNumber', { unique: true })

    const words = db.createObjectStore(STORE_WORDS, { keyPath: 'id' })
    words.createIndex('by-weekId', 'weekId')

    const attempts = db.createObjectStore(STORE_ATTEMPTS, { keyPath: 'id' })
    attempts.createIndex('by-wordId', 'wordId')
    attempts.createIndex('by-date', 'date')
    attempts.createIndex('by-wordId-date', ['wordId', 'date'])
  },
})
