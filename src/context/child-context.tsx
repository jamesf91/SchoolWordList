/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useDb } from '@/context/db-context'
import { getAllProfiles, getProfile } from '@/db/profiles'
import type { ChildProfile } from '@/types'

const LS_ACTIVE_CHILD = 'sp_ac'

interface ChildContextValue {
  activeChild: ChildProfile | null
  setActiveChild(profile: ChildProfile): void
  clearActiveChild(): void
}

const ChildContext = createContext<ChildContextValue | null>(null)

export function ChildProvider({ children }: { children: ReactNode }) {
  const { db } = useDb()
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null)

  // On mount, resolve the stored child id against live profiles in IDB
  useEffect(() => {
    if (!db) return
    const storedId = localStorage.getItem(LS_ACTIVE_CHILD)
    if (!storedId) return

    getProfile(db, storedId).then(profile => {
      if (profile) {
        setActiveChildState(profile)
      } else {
        // Stored id no longer exists (profile was deleted) — clear it
        localStorage.removeItem(LS_ACTIVE_CHILD)
      }
    })
  }, [db])

  // Auto-select if exactly one profile exists and none is active
  useEffect(() => {
    if (!db || activeChild) return
    getAllProfiles(db).then(profiles => {
      if (profiles.length === 1 && profiles[0]) {
        setActiveChildState(profiles[0])
        localStorage.setItem(LS_ACTIVE_CHILD, profiles[0].id)
      }
    })
  }, [db, activeChild])

  const setActiveChild = useCallback((profile: ChildProfile) => {
    localStorage.setItem(LS_ACTIVE_CHILD, profile.id)
    setActiveChildState(profile)
  }, [])

  const clearActiveChild = useCallback(() => {
    localStorage.removeItem(LS_ACTIVE_CHILD)
    setActiveChildState(null)
  }, [])

  return (
    <ChildContext.Provider value={{ activeChild, setActiveChild, clearActiveChild }}>
      {children}
    </ChildContext.Provider>
  )
}

export function useChild(): ChildContextValue {
  const ctx = useContext(ChildContext)
  if (ctx === null) throw new Error('useChild must be used within ChildProvider')
  return ctx
}
