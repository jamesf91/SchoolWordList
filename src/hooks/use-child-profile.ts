import { useCallback, useEffect, useState } from 'react'
import { useDb } from '@/context/db-context'
import { getAllProfiles, upsertProfile, deleteProfile, getAttemptsByChild } from '@/db'
import type { ChildProfile } from '@/types'
import { nanoid } from 'nanoid'

export function useChildProfile() {
  const { db } = useDb()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])

  useEffect(() => {
    if (!db) return
    getAllProfiles(db).then(setProfiles)
  }, [db])

  const refresh = useCallback(async () => {
    if (!db) return
    setProfiles(await getAllProfiles(db))
  }, [db])

  const addProfile = useCallback(async (name: string): Promise<ChildProfile> => {
    if (!db) throw new Error('Database not ready')
    const profile: ChildProfile = { id: nanoid(), name: name.trim(), createdAt: Date.now() }
    await upsertProfile(db, profile)
    await refresh()
    return profile
  }, [db, refresh])

  const renameProfile = useCallback(async (id: string, name: string): Promise<void> => {
    if (!db) throw new Error('Database not ready')
    const existing = profiles.find(p => p.id === id)
    if (!existing) return
    await upsertProfile(db, { ...existing, name: name.trim() })
    await refresh()
  }, [db, profiles, refresh])

  const removeProfile = useCallback(async (id: string): Promise<{ blocked: true; count: number } | { blocked: false }> => {
    if (!db) throw new Error('Database not ready')
    const attempts = await getAttemptsByChild(db, id)
    if (attempts.length > 0) {
      return { blocked: true, count: attempts.length }
    }
    await deleteProfile(db, id)
    await refresh()
    return { blocked: false }
  }, [db, refresh])

  return { profiles, addProfile, renameProfile, removeProfile }
}
