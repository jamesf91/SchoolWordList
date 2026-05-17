import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRevisionSession } from '@/hooks/use-revision-session'
import { useAttempts } from '@/hooks/use-attempts'
import { useTts } from '@/hooks/use-tts'
import { useChild } from '@/context/child-context'
import { SpellingInput } from '@/components/child/spelling-input'
import { ReplayButton } from '@/components/child/replay-button'
import { ResultPanel } from '@/components/child/result-panel'
import { Spinner } from '@/components/ui/spinner'
import { nanoid } from 'nanoid'
import { LABEL_WORD_COUNT } from '@/constants/strings'

interface SessionResult {
  correct: number
  total: number
}

export default function ChildSession() {
  const navigate = useNavigate()
  const { activeChild } = useChild()
  const { words, currentIndex, advance, isComplete, loading } = useRevisionSession()
  const { insertAttempt } = useAttempts()
  const { speak, cancel, isSpeaking, isSupported } = useTts()

  // Redirect to home if no child profile is selected (e.g. direct URL navigation)
  useEffect(() => {
    if (!activeChild) navigate('/', { replace: true })
  }, [activeChild, navigate])
  const [result, setResult] = useState<{ correct: boolean } | null>(null)
  const [sessionResults, setSessionResults] = useState<SessionResult>({ correct: 0, total: 0 })

  const currentWord = words[currentIndex]

  const handleReplay = useCallback(() => {
    if (currentWord && isSupported) speak(currentWord.text)
  }, [currentWord, speak, isSupported])

  const handleSubmit = useCallback(async (answer: string) => {
    if (!currentWord) return
    const isCorrect = answer.trim().toLowerCase() === currentWord.text.trim().toLowerCase()

    await insertAttempt({
      id: nanoid(),
      wordId: currentWord.id,
      date: Date.now(),
      correct: isCorrect,
    })

    setResult({ correct: isCorrect })
    setSessionResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }, [currentWord, insertAttempt])

  const handleNext = useCallback(() => {
    setResult(null)
    cancel()
    if (isComplete || currentIndex >= words.length - 1) {
      navigate('/summary', { state: sessionResults })
    } else {
      advance()
    }
  }, [advance, cancel, currentIndex, isComplete, navigate, sessionResults, words.length])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-xl text-slate-600">No words to practise yet.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8">
      <p className="text-lg font-medium text-slate-500">
        {LABEL_WORD_COUNT(currentIndex + 1, words.length)}
      </p>

      {/* ReplayButton always visible — word text NEVER shown */}
      <ReplayButton onReplay={handleReplay} isSpeaking={isSpeaking} />

      {result === null ? (
        <SpellingInput
          key={currentIndex}
          onSubmit={handleSubmit}
          disabled={false}
        />
      ) : (
        <ResultPanel
          correct={result.correct}
          correctSpelling={currentWord?.text ?? ''}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
