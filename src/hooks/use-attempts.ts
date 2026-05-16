import { useCallback } from 'react'
import { useDatabase } from './use-db'
import { insertAttempt, getAttemptsForWord } from '@/db'
import { consecutiveCorrect, isMastered } from '@/lib/mastery'
import type { Attempt } from '@/types'

interface WordStats {
  attempts: Attempt[]
  streak: number
  mastered: boolean
}

export function useAttempts() {
  const db = useDatabase()

  const handleInsert = useCallback(async (attempt: Attempt): Promise<void> => {
    await insertAttempt(db, attempt)
  }, [db])

  const getWordStats = useCallback(async (wordId: string): Promise<WordStats> => {
    const attempts = await getAttemptsForWord(db, wordId)
    return {
      attempts,
      streak: consecutiveCorrect(attempts),
      mastered: isMastered(attempts),
    }
  }, [db])

  return { insertAttempt: handleInsert, getWordStats }
}
