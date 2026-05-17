import { useCallback, useEffect, useState } from 'react'
import { useDb } from '@/context/db-context'
import { getWordsByWeek, upsertWord, deleteWord } from '@/db'
import type { Word } from '@/types'

export function useWords(weekId: string) {
  const { db } = useDb()
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    if (!db) return
    getWordsByWeek(db, weekId).then(setWords)
  }, [db, weekId])

  const handleUpsert = useCallback(async (word: Word) => {
    if (!db) throw new Error('Database not ready')
    await upsertWord(db, word)
    setWords(await getWordsByWeek(db, weekId))
  }, [db, weekId])

  const handleDelete = useCallback(async (id: string) => {
    if (!db) throw new Error('Database not ready')
    await deleteWord(db, id)
    setWords(await getWordsByWeek(db, weekId))
  }, [db, weekId])

  return { words, upsertWord: handleUpsert, deleteWord: handleDelete }
}
