import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePinGate } from '@/hooks/use-pin-gate'
import { hashPin, loadPinHash, savePinHash, verifyPin } from '@/lib/pin'
import { Button } from '@/components/ui/button'
import { BTN_BACK, BTN_SAVE, MSG_WRONG_PIN, ERR_SAVE_FAILED } from '@/constants/strings'
import { SESSION_SIZE } from '@/constants/config'

const LS_SESSION_SIZE = 'sp_ss'

function loadSessionSize(): number {
  const raw = localStorage.getItem(LS_SESSION_SIZE)
  const n = raw ? parseInt(raw, 10) : SESSION_SIZE
  return isNaN(n) ? SESSION_SIZE : Math.min(20, Math.max(5, n))
}

export default function ParentSettings() {
  const navigate = useNavigate()
  const { lock } = usePinGate()
  const [sessionSize, setSessionSize] = useState(loadSessionSize)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')
  const [clearStep, setClearStep] = useState(0)

  useEffect(() => {
    localStorage.setItem(LS_SESSION_SIZE, String(sessionSize))
  }, [sessionSize])

  async function handleChangePın() {
    if (newPin.length !== 4 || newPin !== confirmPin) {
      setPinMsg('PINs do not match or are not 4 digits')
      return
    }
    const stored = loadPinHash()
    if (stored && !(await verifyPin(currentPin, stored))) {
      setPinMsg(MSG_WRONG_PIN)
      return
    }
    savePinHash(await hashPin(newPin))
    setPinMsg('PIN changed successfully')
    setCurrentPin(''); setNewPin(''); setConfirmPin('')
  }

  async function handleClearData() {
    if (clearStep === 0) { setClearStep(1); return }
    if (clearStep === 1) {
      try {
        lock()
        indexedDB.deleteDatabase('spelling-app')
        localStorage.clear()
        sessionStorage.clear()
        navigate('/')
      } catch {
        setPinMsg(ERR_SAVE_FAILED)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/parent/dashboard')} className="text-sm">{BTN_BACK}</Button>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </div>

        {/* Session size */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Session size</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-600 flex-1">Words per session (5–20)</label>
            <input
              type="number"
              min={5}
              max={20}
              value={sessionSize}
              onChange={e => setSessionSize(Math.min(20, Math.max(5, parseInt(e.target.value, 10) || SESSION_SIZE)))}
              className="w-20 rounded-xl border-2 border-slate-300 px-3 py-2 text-center text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </section>

        {/* Change PIN */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Change code</h2>
          <div className="flex flex-col gap-3">
            {loadPinHash() && (
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Current code"
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="rounded-xl border-2 border-slate-300 px-4 min-h-12 text-lg focus:border-blue-500 focus:outline-none"
              />
            )}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="New code"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="rounded-xl border-2 border-slate-300 px-4 min-h-12 text-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm new code"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="rounded-xl border-2 border-slate-300 px-4 min-h-12 text-lg focus:border-blue-500 focus:outline-none"
            />
            {pinMsg && <p className="text-sm text-slate-600">{pinMsg}</p>}
            <Button onClick={handleChangePın}>{BTN_SAVE} code</Button>
          </div>
        </section>

        {/* Clear all data */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-red-200">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Clear all data</h2>
          <p className="mb-4 text-sm text-slate-600">Permanently deletes all words, weeks, and attempt history.</p>
          <Button
            variant="destructive"
            onClick={handleClearData}
            className="w-full"
          >
            {clearStep === 0 ? 'Clear all data' : 'Tap again to confirm — this cannot be undone'}
          </Button>
        </section>
      </div>
    </div>
  )
}
