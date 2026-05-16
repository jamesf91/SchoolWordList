import { openDB as idbOpenDB, type IDBPDatabase } from 'idb'
import type { Week, Word, Attempt, ChildProfile } from '@/types'
import { DB_NAME, DB_VERSION, STORE_WEEKS, STORE_WORDS, STORE_ATTEMPTS, STORE_PROFILES } from '@/constants/db'

interface SpellingDB {
  [STORE_PROFILES]: {
    key: string
    value: ChildProfile
    indexes: { 'by-name': string }
  }
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
      'by-childId': string
      'by-childId-wordId': [string, string]
    }
  }
}

export type SpellingIDB = IDBPDatabase<SpellingDB>

export const dbPromise: Promise<SpellingIDB> = idbOpenDB<SpellingDB>(DB_NAME, DB_VERSION, {
  async upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      const weeks = db.createObjectStore(STORE_WEEKS, { keyPath: 'id' })
      weeks.createIndex('by-weekNumber', 'weekNumber', { unique: true })

      const words = db.createObjectStore(STORE_WORDS, { keyPath: 'id' })
      words.createIndex('by-weekId', 'weekId')

      const attempts = db.createObjectStore(STORE_ATTEMPTS, { keyPath: 'id' })
      attempts.createIndex('by-wordId', 'wordId')
      attempts.createIndex('by-date', 'date')
      attempts.createIndex('by-wordId-date', ['wordId', 'date'])
    }

    if (oldVersion < 2) {
      // Add profiles store
      const profiles = db.createObjectStore(STORE_PROFILES, { keyPath: 'id' })
      profiles.createIndex('by-name', 'name')

      // Add childId indexes to existing attempts store
      const attemptsStore = tx.objectStore(STORE_ATTEMPTS)
      attemptsStore.createIndex('by-childId', 'childId')
      attemptsStore.createIndex('by-childId-wordId', ['childId', 'wordId'])

      // Create default profile and stamp all legacy attempts with its id
      const defaultProfile: ChildProfile = {
        id: 'child-legacy-1',
        name: 'Child 1',
        createdAt: Date.now(),
      }
      await profiles.add(defaultProfile)

      let cursor = await attemptsStore.openCursor()
      while (cursor) {
        await cursor.update({ ...cursor.value, childId: 'child-legacy-1' })
        cursor = await cursor.continue()
      }
    }
  },
})
