import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePinGate } from '@/hooks/use-pin-gate'
import { loadPinHash } from '@/lib/pin'
import { Button } from '@/components/ui/button'
import { BTN_UNLOCK, MSG_WRONG_PIN } from '@/constants/strings'

const PIN_LENGTH = 4

export function PinEntry() {
  const { unlock } = usePinGate()
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const isFirstRun = loadPinHash() === null
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(false)

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit() {
    const pin = digits.join('')
    if (pin.length < PIN_LENGTH) return

    const ok = await unlock(pin)
    if (ok) {
      navigate('/parent/dashboard')
    } else {
      setError(true)
      setShake(true)
      setDigits(Array(PIN_LENGTH).fill(''))
      setTimeout(() => {
        setShake(false)
        inputRefs.current[0]?.focus()
      }, 600)
    }
  }

  const pinFilled = digits.every(d => d !== '')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl" aria-hidden="true">🔒</span>
        <p className="text-lg text-slate-600">
          {isFirstRun ? 'Choose a 4-digit code' : 'Enter code'}
        </p>
      </div>

      <div
        className={['flex gap-3', shake ? 'animate-[shake_0.5s_ease-in-out]' : ''].join(' ')}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : undefined}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1} of ${PIN_LENGTH}`}
            className={[
              'h-16 w-14 rounded-xl border-2 text-center text-2xl font-bold',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white',
            ].join(' ')}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {MSG_WRONG_PIN}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!pinFilled} className="w-48">
        {BTN_UNLOCK}
      </Button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
