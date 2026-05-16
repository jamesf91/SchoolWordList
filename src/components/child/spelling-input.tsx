import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ARIA_ANSWER_INPUT, BTN_SUBMIT_ANSWER, PLACEHOLDER_ANSWER } from '@/constants/strings'

interface SpellingInputProps {
  onSubmit(answer: string): void
  disabled?: boolean
}

// Callers must pass key={wordIndex} to reset this component between words.
export function SpellingInput({ onSubmit, disabled = false }: SpellingInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={PLACEHOLDER_ANSWER}
        aria-label={ARIA_ANSWER_INPUT}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        className={[
          'w-full rounded-xl border-2 border-slate-300 bg-white px-5',
          'min-h-14 text-2xl font-medium text-slate-900 placeholder:text-slate-400',
          'focus:border-blue-500 focus:outline-none',
          'disabled:opacity-50',
        ].join(' ')}
      />
      <Button onClick={submit} disabled={disabled || !value.trim()} className="w-full text-xl">
        {BTN_SUBMIT_ANSWER}
      </Button>
    </div>
  )
}
