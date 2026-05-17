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

  const keyBtn = [
    'w-[52px] min-h-[44px]',
    'rounded-lg border border-slate-300 bg-white',
    'text-lg font-bold text-slate-800 shadow-sm',
    'active:bg-slate-100 disabled:opacity-40 transition-colors',
  ].join(' ')

  return (
    <div className="flex w-[70vw] flex-col gap-2 mx-auto">

      {/* Row 1: word display box + Check button */}
      <div className="flex gap-2 items-stretch justify-center">
        <div
          role="status"
          aria-live="polite"
          aria-label={ARIA_KEYBOARD_DISPLAY}
          className={[
            'w-[calc(30ch+2.5rem)] min-h-[60px] rounded-xl border-2 bg-white px-5',
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
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="min-h-[60px] px-5 text-lg"
        >
          {BTN_SUBMIT_ANSWER}
        </Button>
      </div>

      {/* Keyboard grid */}
      <div className="flex flex-col gap-1" role="group" aria-label="Keyboard">

        {/* Rows 1–2: standard letter rows */}
        {ROWS.slice(0, 2).map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map(letter => (
              <button key={letter} type="button" onClick={() => handleLetter(letter)}
                disabled={disabled} aria-label={letter} className={keyBtn}>
                {caps ? letter : letter.toLowerCase()}
              </button>
            ))}
          </div>
        ))}

        {/* Row 3: Shift + Z–M letters + Backspace + Clear */}
        <div className="flex justify-center gap-1">
          <button type="button" onClick={handleCaps} disabled={disabled} aria-label="Shift"
            className={[
              keyBtn,
              caps ? 'bg-blue-600 border-blue-600 text-white' : '',
            ].join(' ')}
          >
            ⇧
          </button>
          {ROWS[2].map(letter => (
            <button key={letter} type="button" onClick={() => handleLetter(letter)}
              disabled={disabled} aria-label={letter} className={keyBtn}>
              {caps ? letter : letter.toLowerCase()}
            </button>
          ))}
          <button type="button" onClick={handleBackspace} disabled={disabled || !value}
            aria-label="Backspace" className={keyBtn}>
            ⌫
          </button>
          <button type="button" onClick={handleClear} disabled={disabled || !value}
            aria-label="Clear" className={keyBtn}>
            ✕
          </button>
        </div>

        {/* Row 4: special chars — centred */}
        <div className="flex justify-center gap-1 mt-0.5">
          {SPECIAL_CHARS.map(char => (
            <button key={char} type="button" onClick={() => handleSpecial(char)}
              disabled={disabled} aria-label={char === ' ' ? 'Space' : char}
              className={[
                'min-h-[44px] rounded-lg border border-slate-300 bg-white',
                'text-lg font-bold text-slate-800 shadow-sm',
                'active:bg-slate-100 disabled:opacity-40 transition-colors',
                char === ' ' ? 'px-12' : 'px-4',
              ].join(' ')}
            >
              {char === ' ' ? 'Space' : char}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
