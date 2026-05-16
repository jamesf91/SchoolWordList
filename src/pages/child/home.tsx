import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BTN_START_SESSION, APP_TITLE, MSG_NO_WORDS_BODY } from '@/constants/strings'
import { useDb } from '@/context/db-context'
import { getAllWords } from '@/db/words'

const LONG_PRESS_MS = 3000
const MOVE_THRESHOLD_PX = 10

export default function ChildHome() {
  const navigate = useNavigate()
  const { db, loading } = useDb()
  const [hasWords, setHasWords] = useState(false)
  const [wordsLoading, setWordsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!db) return
    getAllWords(db).then(words => {
      setHasWords(words.length > 0)
      setWordsLoading(false)
    })
  }, [db])

  const cancelLongPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startPosRef.current = null
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY }
    timerRef.current = setTimeout(() => navigate('/parent/pin'), LONG_PRESS_MS)
  }, [navigate])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startPosRef.current) return
    const dx = Math.abs(e.clientX - startPosRef.current.x)
    const dy = Math.abs(e.clientY - startPosRef.current.y)
    if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) cancelLongPress()
  }, [cancelLongPress])

  if (loading || wordsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8 text-center">
      {/* Long-press on title for hidden parent entry — not discoverable by a11y */}
      <h1
        className="select-none text-5xl font-bold text-sky-800"
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerMove={handlePointerMove}
        aria-label={APP_TITLE}
      >
        {APP_TITLE}
      </h1>

      {!hasWords && (
        <p className="text-xl text-slate-500">{MSG_NO_WORDS_BODY}</p>
      )}

      <Button
        onClick={() => navigate('/session')}
        disabled={!hasWords}
        className="min-w-64 py-6 text-2xl"
      >
        {BTN_START_SESSION}
      </Button>
    </div>
  )
}
