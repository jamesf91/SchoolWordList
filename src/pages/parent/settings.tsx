import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePinGate } from '@/hooks/use-pin-gate'
import { useChild } from '@/context/child-context'
import { useChildProfile } from '@/hooks/use-child-profile'
import { hashPin, loadPinHash, savePinHash, verifyPin } from '@/lib/pin'
import { Button } from '@/components/ui/button'
import {
  BTN_BACK, BTN_SAVE, BTN_CANCEL, BTN_DELETE, BTN_EDIT, MSG_WRONG_PIN, ERR_SAVE_FAILED,
  LABEL_EXPORT, BTN_EXPORT, EXPORT_DESC,
  LABEL_IMPORT, BTN_IMPORT, IMPORT_DESC,
  MSG_IMPORT_SUCCESS, MSG_IMPORT_NOTHING, ERR_IMPORT_FAILED,
  LABEL_CHILDREN, BTN_ADD_CHILD, LABEL_CHILD_NAME, PLACEHOLDER_CHILD_NAME,
  MSG_CHILD_NAME_REQUIRED, MSG_CANNOT_DELETE_CHILD,
} from '@/constants/strings'
import { SESSION_SIZE } from '@/constants/config'
import { useDb } from '@/context/db-context'
import { getAllWeeks, upsertWeek } from '@/db/weeks'
import { getAllWords, upsertWord } from '@/db/words'
import { getExample, setExample } from '@/db/examples'
import { exportToXml, parseXml } from '@/lib/xml-io'

const LS_SESSION_SIZE = 'sp_ss'

function loadSessionSize(): number {
  const raw = localStorage.getItem(LS_SESSION_SIZE)
  const n = raw ? parseInt(raw, 10) : SESSION_SIZE
  return isNaN(n) ? SESSION_SIZE : Math.min(20, Math.max(5, n))
}

export default function ParentSettings() {
  const navigate = useNavigate()
  const { lock } = usePinGate()
  const { db } = useDb()
  const { clearActiveChild } = useChild()
  const { profiles, addProfile, renameProfile, removeProfile } = useChildProfile()
  const [sessionSize, setSessionSize] = useState(loadSessionSize)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')
  const [clearStep, setClearStep] = useState(0)
  const [importMsg, setImportMsg] = useState('')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Child profile management state
  const [newChildName, setNewChildName] = useState('')
  const [newChildMsg, setNewChildMsg] = useState('')
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [editingChildName, setEditingChildName] = useState('')
  const [deleteChildMsg, setDeleteChildMsg] = useState<Record<string, string>>({})

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

  async function handleExport() {
    if (!db) return
    const [weeks, words] = await Promise.all([getAllWeeks(db), getAllWords(db)])
    const exampleEntries = await Promise.all(
      words.map(async w => {
        const sentence = await getExample(db, w.id)
        return sentence ? ([w.id, sentence] as [string, string]) : null
      })
    )
    const examples = new Map<string, string>(
      exampleEntries.filter((e): e is [string, string] => e !== null)
    )
    const xml = exportToXml(weeks, words, examples)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spelling-wordlists-${new Date().toISOString().slice(0, 10)}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setImportMsg('')
    setImportErrors([])
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !db) return
    e.target.value = ''

    let text: string
    try {
      text = await file.text()
    } catch {
      setImportMsg(ERR_IMPORT_FAILED)
      return
    }

    const { weeks, words, examples, errors } = parseXml(text)
    setImportErrors(errors)

    if (weeks.length === 0) {
      setImportMsg(MSG_IMPORT_NOTHING)
      return
    }

    for (const week of weeks) await upsertWeek(db, week)
    for (const word of words) await upsertWord(db, word)
    for (const [wordId, sentence] of examples) await setExample(db, wordId, sentence)
    setImportMsg(MSG_IMPORT_SUCCESS(weeks.length, words.length))
  }

  async function handleAddChild() {
    if (!newChildName.trim()) { setNewChildMsg(MSG_CHILD_NAME_REQUIRED); return }
    await addProfile(newChildName)
    setNewChildName('')
    setNewChildMsg('')
  }

  async function handleRenameChild(id: string) {
    if (!editingChildName.trim()) return
    await renameProfile(id, editingChildName)
    setEditingChildId(null)
    setEditingChildName('')
  }

  async function handleDeleteChild(id: string) {
    const result = await removeProfile(id)
    if (result.blocked) {
      setDeleteChildMsg(prev => ({ ...prev, [id]: MSG_CANNOT_DELETE_CHILD(result.count) }))
    } else {
      clearActiveChild()
      setDeleteChildMsg(prev => { const next = { ...prev }; delete next[id]; return next })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/parent/dashboard')} className="text-sm">{BTN_BACK}</Button>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </div>

        {/* Children */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{LABEL_CHILDREN}</h2>
          <div className="flex flex-col gap-2 mb-4">
            {profiles.map(profile => (
              <div key={profile.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                {editingChildId === profile.id ? (
                  <>
                    <input
                      autoFocus
                      value={editingChildName}
                      onChange={e => setEditingChildName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameChild(profile.id) }}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:outline-none focus:border-blue-500"
                      aria-label={LABEL_CHILD_NAME}
                    />
                    <Button variant="secondary" onClick={() => setEditingChildId(null)} className="text-sm px-3">{BTN_CANCEL}</Button>
                    <Button onClick={() => handleRenameChild(profile.id)} className="text-sm px-3">{BTN_SAVE}</Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-slate-800">{profile.name}</span>
                    <Button variant="ghost" onClick={() => { setEditingChildId(profile.id); setEditingChildName(profile.name) }} className="text-sm px-3">{BTN_EDIT}</Button>
                    <Button variant="ghost" onClick={() => handleDeleteChild(profile.id)} className="text-sm px-3 text-red-600">{BTN_DELETE}</Button>
                  </>
                )}
              </div>
            ))}
            {profiles.map(profile => deleteChildMsg[profile.id] && (
              <p key={`msg-${profile.id}`} className="text-xs text-amber-700 px-1">{deleteChildMsg[profile.id]}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChildName}
              onChange={e => setNewChildName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddChild() }}
              placeholder={PLACEHOLDER_CHILD_NAME}
              aria-label={LABEL_CHILD_NAME}
              className="flex-1 rounded-xl border-2 border-slate-300 px-4 min-h-12 text-base focus:border-blue-500 focus:outline-none"
            />
            <Button onClick={handleAddChild}>{BTN_ADD_CHILD}</Button>
          </div>
          {newChildMsg && <p className="mt-2 text-sm text-amber-700">{newChildMsg}</p>}
        </section>

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

        {/* Export */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">{LABEL_EXPORT}</h2>
          <p className="mb-4 text-sm text-slate-600">{EXPORT_DESC}</p>
          <Button onClick={handleExport} className="w-full">{BTN_EXPORT}</Button>
        </section>

        {/* Import */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">{LABEL_IMPORT}</h2>
          <p className="mb-4 text-sm text-slate-600">{IMPORT_DESC}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,application/xml,text/xml"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={handleImportClick} className="w-full">{BTN_IMPORT}</Button>
          {importMsg && <p className="mt-3 text-sm text-slate-700">{importMsg}</p>}
          {importErrors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {importErrors.map((err, i) => (
                <li key={i} className="text-xs text-amber-700">{err}</li>
              ))}
            </ul>
          )}
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
