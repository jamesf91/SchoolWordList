import { useCallback, useEffect, useState } from 'react'
import { useDatabase } from './use-db'
import { getAllWeeks, upsertWeek, deleteWeek } from '@/db'
import type { Week } from '@/types'

export function useWeeks() {
  const db = useDatabase()
  const [weeks, setWeeks] = useState<Week[]>([])

  useEffect(() => {
    getAllWeeks(db).then(setWeeks)
  }, [db])

  const handleUpsert = useCallback(async (week: Week) => {
    await upsertWeek(db, week)
    setWeeks(await getAllWeeks(db))
  }, [db])

  const handleDelete = useCallback(async (id: string) => {
    await deleteWeek(db, id)
    setWeeks(await getAllWeeks(db))
  }, [db])

  return { weeks, upsertWeek: handleUpsert, deleteWeek: handleDelete }
}
