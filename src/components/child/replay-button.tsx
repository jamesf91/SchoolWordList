import { ARIA_REPLAY_WORD, BTN_REPLAY_WORD } from '@/constants/strings'

interface ReplayButtonProps {
  onReplay(): void
  isSpeaking: boolean
}

export function ReplayButton({ onReplay, isSpeaking }: ReplayButtonProps) {
  return (
    <button
      type="button"
      onClick={onReplay}
      aria-label={ARIA_REPLAY_WORD}
      className={[
        'flex min-h-14 min-w-14 items-center justify-center gap-3 rounded-2xl',
        'bg-blue-50 px-6 text-blue-700 text-xl font-semibold',
        'hover:bg-blue-100 active:bg-blue-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isSpeaking ? 'animate-pulse' : '',
      ].join(' ')}
    >
      <span className="text-2xl" aria-hidden="true">🔊</span>
      {BTN_REPLAY_WORD}
    </button>
  )
}
