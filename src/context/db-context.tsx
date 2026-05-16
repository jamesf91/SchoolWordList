/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dbPromise, type SpellingIDB } from '@/db/schema'
import { ERR_DB_OPEN } from '@/constants/strings'

interface DbContextValue {
  db: SpellingIDB | null
  loading: boolean
  error: string | null
}

const DbContext = createContext<DbContextValue | null>(null)

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SpellingIDB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dbPromise
      .then(instance => {
        setDb(instance)
        setLoading(false)
      })
      .catch(() => {
        setError(ERR_DB_OPEN)
        setLoading(false)
      })
  }, [])

  return <DbContext.Provider value={{ db, loading, error }}>{children}</DbContext.Provider>
}

export function useDb(): DbContextValue {
  const ctx = useContext(DbContext)
  if (ctx === null) throw new Error('useDb must be used within DbProvider')
  return ctx
}
