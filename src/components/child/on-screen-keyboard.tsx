import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BTN_CLEAR_ANSWER, BTN_SUBMIT_ANSWER, ARIA_KEYBOARD_DISPLAY } from '@/constants/strings'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const SPECIAL_CHARS = ['-', '_', "'", ' '] as const

interface OnScreenKeyboardProps {
  onSubmit(answer: string): void
  disabled?: boolean
}

export function OnScreenKeyboard({ onSubmit, disabled = false }: OnScreenKeyboardProps) {
  const [value, setValue] = useState('')
  const [caps, setCaps] = useState(false)

  const handleLetter = useCallback((letter: string) => {
    setValue(prev => prev + (caps ? letter : letter.toLowerCase()))
  }, [caps])

  const handleSpecial = useCallback((char: string) => {
    setValue(prev => prev + char)
  }, [])

  const handleBackspace = useCallback(() => {
    setValue(prev => prev.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    setValue('')
  }, [])

  const handleCaps = useCallback(() => {
    setCaps(prev => !prev)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
  }, [value, disabled, onSubmit])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (disabled) return
      if (/^[a-zA-Z]$/.test(e.key)) {
        handleLetter(e.key.toUpperCase())
      } else if ((SPECIAL_CHARS as readonly string[]).includes(e.key)) {
        handleSpecial(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Enter') {
        handleSubmit()
      } else if (e.key === 'CapsLock' || e.key === 'Shift') {
        handleCaps()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, handleLetter, handleSpecial, handleBackspace, handleSubmit, handleCaps])

  return (
    <div className="flex w-full flex-col gap-3 landscape:flex-row landscape:gap-6">

      {/* Display area — left in landscape, top in portrait */}
      <div className="flex flex-col justify-center landscape:w-2/5">
        <div
          role="status"
          aria-live="polite"
          aria-label={ARIA_KEYBOARD_DISPLAY}
          className={[
            'min-h-[64px] w-full rounded-xl border-2 bg-white px-5',
            'flex items-center text-2xl font-mono tracking-[0.15em] text-slate-900',
            value ? 'border-blue-400' : 'border-slate-300',
          ].join(' ')}
        >
          {value || (
            <span className="text-slate-400 text-xl font-sans tracking-normal">
              Tap the letters…
            </span>
          )}
        </div>
      </div>

      {/* Keyboard grid — right in landscape, bottom in portrait */}
      <div className="flex flex-col gap-1.5 landscape:w-3/5" role="group" aria-label="Keyboard">

        {/* Letter rows */}
        {ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map(letter => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetter(letter)}
                disabled={disabled}
                aria-label={letter}
                className={[
                  'flex-1 max-w-[52px] min-h-[44px] landscape:min-h-[44px]',
                  'rounded-lg border border-slate-300 bg-white',
                  'text-lg font-bold text-slate-800 shadow-sm',
                  'active:bg-slate-100 disabled:opacity-40',
                  'transition-colors',
                ].join(' ')}
              >
                {caps ? letter : letter.toLowerCase()}
              </button>
            ))}
          </div>
        ))}

        {/* Special characters row */}
        <div className="flex justify-center gap-1 mt-0.5">
          <Button
            variant={caps ? 'primary' : 'secondary'}
            onClick={handleCaps}
            disabled={disabled}
            aria-label="Shift"
            className="min-h-[44px] px-3 text-lg"
          >
            ⇧
          </Button>
          {SPECIAL_CHARS.map(char => (
            <button
              key={char}
              type="button"
              onClick={() => handleSpecial(char)}
              disabled={disabled}
              aria-label={char === ' ' ? 'Space' : char}
              className={[
                'min-h-[44px] rounded-lg border border-slate-300 bg-white',
                char === ' ' ? 'px-6' : 'px-3',
                'text-lg font-bold text-slate-800 shadow-sm',
                'active:bg-slate-100 disabled:opacity-40 transition-colors',
              ].join(' ')}
            >
              {char === ' ' ? 'Space' : char}
            </button>
          ))}
        </div>

        {/* Action row */}
        <div className="flex gap-2 mt-1">
          <Button
            variant="secondary"
            onClick={handleBackspace}
            disabled={disabled || !value}
            aria-label="Backspace"
            className="min-h-[44px] px-4 text-lg"
          >
            ⌫
          </Button>
          <Button
            variant="secondary"
            onClick={handleClear}
            disabled={disabled || !value}
            className="min-h-[44px] px-4 text-lg"
          >
            {BTN_CLEAR_ANSWER}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="flex-1 min-h-[44px] text-lg"
          >
            {BTN_SUBMIT_ANSWER}
          </Button>
        </div>
      </div>
    </div>
  )
}
