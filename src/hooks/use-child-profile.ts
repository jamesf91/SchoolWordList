import { useCallback, useEffect, useState } from 'react'
import { useDatabase } from './use-db'
import { getAllProfiles, upsertProfile, deleteProfile, getAttemptsByChild } from '@/db'
import type { ChildProfile } from '@/types'
import { nanoid } from 'nanoid'

export function useChildProfile() {
  const db = useDatabase()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])

  useEffect(() => {
    getAllProfiles(db).then(setProfiles)
  }, [db])

  const refresh = useCallback(async () => {
    setProfiles(await getAllProfiles(db))
  }, [db])

  const addProfile = useCallback(async (name: string): Promise<ChildProfile> => {
    const profile: ChildProfile = { id: nanoid(), name: name.trim(), createdAt: Date.now() }
    await upsertProfile(db, profile)
    await refresh()
    return profile
  }, [db, refresh])

  const renameProfile = useCallback(async (id: string, name: string): Promise<void> => {
    const existing = profiles.find(p => p.id === id)
    if (!existing) return
    await upsertProfile(db, { ...existing, name: name.trim() })
    await refresh()
  }, [db, profiles, refresh])

  const removeProfile = useCallback(async (id: string): Promise<{ blocked: true; count: number } | { blocked: false }> => {
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
