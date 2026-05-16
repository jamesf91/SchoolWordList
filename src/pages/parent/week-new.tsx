import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeeks } from '@/hooks/use-weeks'
import { Button } from '@/components/ui/button'
import { BTN_SAVE, BTN_CANCEL, LABEL_WEEK_NUMBER, LABEL_FOCUS_SOUND, PLACEHOLDER_FOCUS_SOUND } from '@/constants/strings'
import { nanoid } from 'nanoid'

export default function WeekNew() {
  const navigate = useNavigate()
  const { upsertWeek } = useWeeks()
  const [weekNumber, setWeekNumber] = useState('')
  const [focusSound, setFocusSound] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(weekNumber, 10)
    if (!num || !focusSound.trim()) return
    setSaving(true)
    const id = nanoid()
    await upsertWeek({ id, weekNumber: num, focusSound: focusSound.trim(), createdAt: Date.now() })
    navigate(`/parent/weeks/${id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">New Week</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{LABEL_WEEK_NUMBER}</label>
            <input
              type="number"
              min={1}
              value={weekNumber}
              onChange={e => setWeekNumber(e.target.value)}
              required
              className="rounded-xl border-2 border-slate-300 px-4 min-h-14 text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{LABEL_FOCUS_SOUND}</label>
            <input
              type="text"
              value={focusSound}
              onChange={e => setFocusSound(e.target.value)}
              placeholder={PLACEHOLDER_FOCUS_SOUND}
              required
              className="rounded-xl border-2 border-slate-300 px-4 min-h-14 text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
              {BTN_CANCEL}
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {BTN_SAVE}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
