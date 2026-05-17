import { useNavigate } from 'react-router-dom'
import { useWeeks } from '@/hooks/use-weeks'
import { useDb } from '@/context/db-context'
import { usePinGate } from '@/hooks/use-pin-gate'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { NAV_PROGRESS, NAV_SETTINGS, BTN_ADD_WEEK, BTN_EXIT_PARENT_MODE, MSG_NO_WEEKS } from '@/constants/strings'
import { useEffect, useState } from 'react'
import { getAllWords } from '@/db/words'
import type { Word } from '@/types'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { lock } = usePinGate()
  const { db } = useDb()
  const { weeks } = useWeeks()
  const [wordsByWeek, setWordsByWeek] = useState<Record<string, Word[]>>({})

  useEffect(() => {
    if (!db) return
    getAllWords(db).then(words => {
      const map: Record<string, Word[]> = {}
      for (const w of words) {
        if (!map[w.weekId]) map[w.weekId] = []
        map[w.weekId]!.push(w)
      }
      setWordsByWeek(map)
    })
  }, [db, weeks])

  if (!db) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Word Lists</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/parent/progress')} className="text-sm">
              {NAV_PROGRESS}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/parent/settings')} className="text-sm">
              {NAV_SETTINGS}
            </Button>
            <Button variant="secondary" onClick={lock} className="text-sm">
              {BTN_EXIT_PARENT_MODE}
            </Button>
          </div>
        </div>

        {weeks.length === 0 ? (
          <p className="text-center text-slate-500 py-12">{MSG_NO_WEEKS}</p>
        ) : (
          <div className="flex flex-col gap-4 mb-6">
            {[...weeks].sort((a, b) => b.weekNumber - a.weekNumber).map(week => (
              <Card
                key={week.id}
                className="cursor-pointer hover:ring-blue-300 transition-all"
                onClick={() => navigate(`/parent/weeks/${week.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Week {week.weekNumber}</p>
                    <p className="text-sm text-slate-500">Focus sound: {week.focusSound}</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {wordsByWeek[week.id]?.length ?? 0} words
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={() => navigate('/parent/weeks/new')} className="w-full">
          {BTN_ADD_WEEK}
        </Button>
      </div>
    </div>
  )
}
