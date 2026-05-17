import { useCallback } from 'react'
import { useDb } from '@/context/db-context'
import { useChild } from '@/context/child-context'
import { insertAttempt, getAttemptsForWord } from '@/db'
import { consecutiveCorrect, isMastered } from '@/lib/mastery'
import type { Attempt } from '@/types'

interface WordStats {
  attempts: Attempt[]
  streak: number
  mastered: boolean
}

export function useAttempts() {
  const { db } = useDb()
  const { activeChild } = useChild()

  const handleInsert = useCallback(async (attempt: Omit<Attempt, 'childId'>): Promise<void> => {
    if (!db) throw new Error('Database not ready')
    if (!activeChild) throw new Error('No active child selected')
    await insertAttempt(db, { ...attempt, childId: activeChild.id })
  }, [db, activeChild])

  const getWordStats = useCallback(async (wordId: string): Promise<WordStats> => {
    if (!db || !activeChild) return { attempts: [], streak: 0, mastered: false }
    const attempts = await getAttemptsForWord(db, wordId, activeChild.id)
    return {
      attempts,
      streak: consecutiveCorrect(attempts),
      mastered: isMastered(attempts),
    }
  }, [db, activeChild])

  return { insertAttempt: handleInsert, getWordStats }
}
