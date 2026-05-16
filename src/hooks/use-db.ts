import { useDb } from '@/context/db-context'
import type { SpellingIDB } from '@/db/schema'

/** Returns the open IDBPDatabase. Throws if used outside DbProvider or before DB is ready. */
export function useDatabase(): SpellingIDB {
  const { db, loading, error } = useDb()
  if (loading) throw new Error('Database is still loading')
  if (error) throw new Error(error)
  if (!db) throw new Error('Database is not available')
  return db
}
