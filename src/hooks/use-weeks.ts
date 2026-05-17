import { useCallback, useEffect, useState } from 'react'
import { useDb } from '@/context/db-context'
import { getAllWeeks, upsertWeek, deleteWeek } from '@/db'
import type { Week } from '@/types'

export function useWeeks() {
  const { db } = useDb()
  const [weeks, setWeeks] = useState<Week[]>([])

  useEffect(() => {
    if (!db) return
    getAllWeeks(db).then(setWeeks)
  }, [db])

  const handleUpsert = useCallback(async (week: Week) => {
    if (!db) throw new Error('Database not ready')
    await upsertWeek(db, week)
    setWeeks(await getAllWeeks(db))
  }, [db])

  const handleDelete = useCallback(async (id: string) => {
    if (!db) throw new Error('Database not ready')
    await deleteWeek(db, id)
    setWeeks(await getAllWeeks(db))
  }, [db])

  return { weeks, upsertWeek: handleUpsert, deleteWeek: handleDelete }
}
