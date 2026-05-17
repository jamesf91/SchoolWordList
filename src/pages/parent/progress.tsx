import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/context/db-context'
import { getAllWords } from '@/db/words'
import { getRecentAttemptsGroupedByWord } from '@/db/attempts'
import { getAllProfiles } from '@/db/profiles'
import { isMastered, consecutiveCorrect } from '@/lib/mastery'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BTN_BACK, LABEL_MASTERED, LABEL_STRUGGLING, MSG_NO_ATTEMPTS } from '@/constants/strings'
import type { Word, Attempt, ChildProfile } from '@/types'

interface WordStat {
  word: Word
  attempts: Attempt[]
  mastered: boolean
  struggling: boolean
  streak: number
  total: number
  correct: number
}

export default function ParentProgress() {
  const navigate = useNavigate()
  const { db } = useDb()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [stats, setStats] = useState<WordStat[]>([])
  const [loading, setLoading] = useState(true)

  // Load profiles once on mount
  useEffect(() => {
    if (!db) return
    getAllProfiles(db).then(p => {
      setProfiles(p)
      if (p.length > 0 && p[0]) setSelectedChildId(p[0].id)
    })
  }, [db])

  // Reload stats whenever selectedChildId changes
  useEffect(() => {
    if (!db || !selectedChildId) return
    setLoading(true)
    Promise.all([getAllWords(db), getRecentAttemptsGroupedByWord(db, selectedChildId)]).then(([words, attemptsMap]) => {
      const wordStats: WordStat[] = words.map(word => {
        const attempts = attemptsMap.get(word.id) ?? []
        const wrongCount = attempts.filter(a => !a.correct).length
        return {
          word,
          attempts,
          mastered: isMastered(attempts),
          struggling: wrongCount >= 2 && !isMastered(attempts),
          streak: consecutiveCorrect(attempts),
          total: attempts.length,
          correct: attempts.filter(a => a.correct).length,
        }
      })
      wordStats.sort((a, b) => {
        if (a.struggling !== b.struggling) return a.struggling ? -1 : 1
        if (a.mastered !== b.mastered) return a.mastered ? 1 : -1
        return 0
      })
      setStats(wordStats)
      setLoading(false)
    })
  }, [db, selectedChildId])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>

  const wordsWithAttempts = stats.filter(s => s.total > 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/parent/dashboard')} className="text-sm">{BTN_BACK}</Button>
          <h1 className="text-2xl font-bold text-slate-800 flex-1">Progress</h1>
          {profiles.length > 1 && (
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="rounded-xl border-2 border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        {profiles.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No child profiles yet. Add a child in Settings.</p>
        ) : wordsWithAttempts.length === 0 ? (
          <p className="text-center text-slate-500 py-12">{MSG_NO_ATTEMPTS}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {wordsWithAttempts.map(({ word, total, correct, mastered, struggling }) => {
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0
              const label = mastered ? LABEL_MASTERED : struggling ? LABEL_STRUGGLING : 'In progress'
              const barColor = mastered ? 'bg-green-500' : struggling ? 'bg-amber-500' : 'bg-blue-500'
              return (
                <div key={word.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-800">{word.text}</span>
                    <span className="text-slate-400">{label} · {correct}/{total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={['h-2 rounded-full transition-all', barColor].join(' ')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
