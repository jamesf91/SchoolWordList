import { useCallback, useEffect, useState } from 'react'
import { useDb } from '@/context/db-context'
import { getAllWeeks } from '@/db/weeks'
import { getAllWords } from '@/db/words'
import { getAllAttempts } from '@/db/attempts'
import { buildRevisionList } from '@/lib/revisionList'
import type { Word } from '@/types'

interface RevisionSession {
  words: Word[]
  currentIndex: number
  advance(): void
  isComplete: boolean
  loading: boolean
}

const MS_PER_HOUR = 60 * 60 * 1000

/** Groups attempt records by the hour they occurred in to identify the last session. */
function lastSessionWordIds(allAttempts: { wordId: string; date: number }[]): string[] {
  if (allAttempts.length === 0) return []
  const latestDate = Math.max(...allAttempts.map(a => a.date))
  const latestHour = Math.floor(latestDate / MS_PER_HOUR)
  const ids = allAttempts
    .filter(a => Math.floor(a.date / MS_PER_HOUR) === latestHour)
    .map(a => a.wordId)
  return [...new Set(ids)]
}

export function useRevisionSession(): RevisionSession {
  const { db, loading: dbLoading } = useDb()
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dbLoading || !db) return

    async function load() {
      const [allWeeks, allWords, allAttempts] = await Promise.all([
        getAllWeeks(db!),
        getAllWords(db!),
        getAllAttempts(db!),
      ])

      const sessionWords = buildRevisionList({
        allWords,
        allWeeks,
        allAttempts,
        lastSessionWordIds: lastSessionWordIds(allAttempts),
        currentDate: Date.now(),
      })

      setWords(sessionWords)
      setLoading(false)
    }

    load()
  }, [db, dbLoading])

  const advance = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= words.length) {
        setIsComplete(true)
      }
      return next
    })
  }, [words.length])

  return { words, currentIndex, advance, isComplete, loading }
}
