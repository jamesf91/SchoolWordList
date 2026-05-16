/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  hashPin,
  verifyPin,
  savePinHash,
  loadPinHash,
  setSessionUnlocked,
  isSessionUnlocked,
  clearSession,
} from '@/lib/pin'

interface PinContextValue {
  isUnlocked: boolean
  unlock(pin: string): Promise<boolean>
  lock(): void
}

const PinContext = createContext<PinContextValue | null>(null)

export function PinProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  // Lazy initialiser restores session from sessionStorage on first render
  const [isUnlocked, setIsUnlocked] = useState(isSessionUnlocked)

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const storedHash = loadPinHash()

    if (storedHash === null) {
      // First run — store the entered PIN as the initial PIN
      const hash = await hashPin(pin)
      savePinHash(hash)
      setSessionUnlocked()
      setIsUnlocked(true)
      return true
    }

    const valid = await verifyPin(pin, storedHash)
    if (valid) {
      setSessionUnlocked()
      setIsUnlocked(true)
    }
    return valid
  }, [])

  const lock = useCallback(() => {
    clearSession()
    setIsUnlocked(false)
    navigate('/')
  }, [navigate])

  return (
    <PinContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </PinContext.Provider>
  )
}

export function usePin(): PinContextValue {
  const ctx = useContext(PinContext)
  if (ctx === null) throw new Error('usePin must be used within PinProvider')
  return ctx
}
