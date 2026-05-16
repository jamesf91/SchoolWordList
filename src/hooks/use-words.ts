import { useCallback, useEffect, useState } from 'react'
import { useDatabase } from './use-db'
import { getWordsByWeek, upsertWord, deleteWord } from '@/db'
import type { Word } from '@/types'

export function useWords(weekId: string) {
  const db = useDatabase()
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    getWordsByWeek(db, weekId).then(setWords)
  }, [db, weekId])

  const handleUpsert = useCallback(async (word: Word) => {
    await upsertWord(db, word)
    setWords(await getWordsByWeek(db, weekId))
  }, [db, weekId])

  const handleDelete = useCallback(async (id: string) => {
    await deleteWord(db, id)
    setWords(await getWordsByWeek(db, weekId))
  }, [db, weekId])

  return { words, upsertWord: handleUpsert, deleteWord: handleDelete }
}
