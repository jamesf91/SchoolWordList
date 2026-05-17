import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDb } from '@/context/db-context'
import { useChild } from '@/context/child-context'
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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

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
  const { activeChild } = useChild()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') // 'all' | null
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dbLoading || !db) return

    async function load() {
      const childId = activeChild?.id
      const [allWeeks, allWords, allAttempts] = await Promise.all([
        getAllWeeks(db!),
        getAllWords(db!),
        childId ? getAllAttempts(db!, childId) : Promise.resolve([]),
      ])

      let sessionWords: Word[]
      if (mode === 'all') {
        sessionWords = shuffle(allWords).slice(0, 10)
      } else {
        sessionWords = buildRevisionList({
          allWords,
          allWeeks,
          allAttempts,
          lastSessionWordIds: lastSessionWordIds(allAttempts),
          currentDate: Date.now(),
        })
      }

      setWords(sessionWords)
      setLoading(false)
    }

    load()
  }, [db, dbLoading, activeChild, mode])

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
