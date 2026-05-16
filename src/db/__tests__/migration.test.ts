import { describe, it, expect, beforeEach, vi } from 'vitest'
// Installs IDBRequest, IDBCursor, IDBFactory etc. as globals — required by idb
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { openDB } from 'idb'

// idb reads globalThis.indexedDB at call time. We replace it with a fresh
// FDBFactory instance before each test for full isolation.
const DB_NAME = 'spelling-app'

async function seedV1(): Promise<void> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      const attempts = db.createObjectStore('attempts', { keyPath: 'id' })
      attempts.createIndex('by-wordId', 'wordId')
      attempts.createIndex('by-date', 'date')
      attempts.createIndex('by-wordId-date', ['wordId', 'date'])
      db.createObjectStore('weeks', { keyPath: 'id' })
      db.createObjectStore('words', { keyPath: 'id' })
    },
  })
  // Intentionally inserting v1-shaped records without childId to simulate legacy data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.put('attempts', { id: 'att-1', wordId: 'word-1', date: 1000, correct: true } as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.put('attempts', { id: 'att-2', wordId: 'word-2', date: 2000, correct: false } as any)
  db.close()
}

async function openMigrated() {
  // vi.resetModules ensures a fresh dbPromise is created against the current
  // globalThis.indexedDB rather than reusing a cached module-level promise
  vi.resetModules()
  const { dbPromise } = await import('../schema')
  return dbPromise
}

beforeEach(async () => {
  // Replace global indexedDB with a fresh empty instance for each test
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.indexedDB = new IDBFactory() as any
  await seedV1()
})

describe('DB migration v1 → v2', () => {
  it('stamps all legacy attempts with childId="child-legacy-1"', async () => {
    const db = await openMigrated()
    const attempts = await db.getAll('attempts')
    expect(attempts).toHaveLength(2)
    for (const attempt of attempts) {
      expect((attempt as { childId: string }).childId).toBe('child-legacy-1')
    }
  })

  it('creates a default "Child 1" profile with id "child-legacy-1"', async () => {
    const db = await openMigrated()
    const profile = await db.get('profiles', 'child-legacy-1')
    expect(profile).toBeDefined()
    expect(profile?.name).toBe('Child 1')
    expect(profile?.id).toBe('child-legacy-1')
    expect(typeof profile?.createdAt).toBe('number')
  })

  it('adds the by-childId index to the attempts store', async () => {
    const db = await openMigrated()
    const tx = db.transaction('attempts', 'readonly')
    const store = tx.objectStore('attempts')
    expect(Array.from(store.indexNames)).toContain('by-childId')
  })

  it('preserves all original attempt fields through migration', async () => {
    const db = await openMigrated()
    const att1 = await db.get('attempts', 'att-1')
    expect(att1).toMatchObject({ id: 'att-1', wordId: 'word-1', date: 1000, correct: true })
    const att2 = await db.get('attempts', 'att-2')
    expect(att2).toMatchObject({ id: 'att-2', wordId: 'word-2', date: 2000, correct: false })
  })

  it('can query attempts by childId via the new index', async () => {
    const db = await openMigrated()
    const results = await db.getAllFromIndex('attempts', 'by-childId', 'child-legacy-1')
    expect(results).toHaveLength(2)
  })
})
