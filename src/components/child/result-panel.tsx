import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  BTN_NEXT_WORD,
  CELEBRATION_MESSAGES,
  MSG_INCORRECT,
  MSG_INCORRECT_ENCOURAGEMENT,
  LABEL_EXAMPLE_SENTENCE,
} from '@/constants/strings'

interface ResultPanelProps {
  correct: boolean
  correctSpelling: string
  exampleSentence?: string | null
  onNext(): void
}

function randomCelebration(): string {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)] ?? 'Well done!'
}

export function ResultPanel({ correct, correctSpelling, exampleSentence, onNext }: ResultPanelProps) {
  // Pick once per result display, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const celebration = useMemo(() => randomCelebration(), [correct])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      {correct ? (
        <div className="animate-bounce text-4xl font-bold text-green-600">{celebration}</div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xl text-slate-600">{MSG_INCORRECT}</p>
          <p className="text-3xl font-bold tracking-wide text-slate-700">{correctSpelling}</p>
          <p className="text-base text-slate-500">{MSG_INCORRECT_ENCOURAGEMENT}</p>
        </div>
      )}
      {exampleSentence && (
        <p className="text-base text-slate-500 italic">
          <span className="not-italic font-medium text-slate-600">{LABEL_EXAMPLE_SENTENCE}</span>{' '}
          {exampleSentence}
        </p>
      )}

      <Button onClick={onNext} className="w-full text-xl">
        {BTN_NEXT_WORD}
      </Button>
    </div>
  )
}
