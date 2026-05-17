import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWords } from '@/hooks/use-words'
import { useWeeks } from '@/hooks/use-weeks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  BTN_ADD_WORD, BTN_SAVE, BTN_CANCEL, BTN_DELETE,
  LABEL_WORD_TEXT, PLACEHOLDER_WORD,
  CATEGORY_LABELS, MSG_DELETE_WORD_CONFIRM, MSG_NO_WORDS_IN_WEEK, BTN_BACK,
} from '@/constants/strings'
import type { Word, WordCategory } from '@/types'
import { nanoid } from 'nanoid'

const CATEGORIES: WordCategory[] = ['core', 'tricky', 'extension']

export default function WeekDetail() {
  const { weekId } = useParams<{ weekId: string }>()
  const navigate = useNavigate()
  const { weeks } = useWeeks()
  const { words, upsertWord, deleteWord } = useWords(weekId ?? '')
  const [adding, setAdding] = useState<WordCategory | null>(null)
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const week = weeks.find(w => w.id === weekId)

  if (!week) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>

  async function handleAddWord(category: WordCategory) {
    if (!newText.trim() || !weekId) return
    const texts = newText.split(',').map(w => w.trim()).filter(Boolean)
    await Promise.all(texts.map(text => upsertWord({ id: nanoid(), weekId, text, category })))
    setNewText('')
    setAdding(null)
  }

  async function handleEditSave(word: Word) {
    if (!editText.trim()) return
    await upsertWord({ ...word, text: editText.trim() })
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    await deleteWord(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/parent/dashboard')} className="text-sm">
            {BTN_BACK}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Week {week.weekNumber}</h1>
            <p className="text-sm text-slate-500">Focus sound: {week.focusSound}</p>
          </div>
        </div>

        {CATEGORIES.map(category => {
          const categoryWords = words.filter(w => w.category === category)
          return (
            <div key={category} className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Badge category={category} />
                <span className="text-sm text-slate-400">{categoryWords.length} words</span>
              </div>

              {categoryWords.length === 0 && adding !== category && (
                <p className="text-sm text-slate-400 mb-2">{MSG_NO_WORDS_IN_WEEK}</p>
              )}

              <div className="flex flex-col gap-2">
                {categoryWords.map(word => (
                  <div key={word.id} className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    {editingId === word.id ? (
                      <>
                        <input
                          autoFocus
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:outline-none focus:border-blue-500"
                        />
                        <Button variant="secondary" onClick={() => setEditingId(null)} className="text-sm px-3">{BTN_CANCEL}</Button>
                        <Button onClick={() => handleEditSave(word)} className="text-sm px-3">{BTN_SAVE}</Button>
                      </>
                    ) : confirmDeleteId === word.id ? (
                      <>
                        <p className="flex-1 text-sm text-slate-600">{MSG_DELETE_WORD_CONFIRM(word.text)}</p>
                        <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} className="text-sm px-3">{BTN_CANCEL}</Button>
                        <Button variant="destructive" onClick={() => handleDelete(word.id)} className="text-sm px-3">{BTN_DELETE}</Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-base font-medium text-slate-800">{word.text}</span>
                        <Button variant="ghost" onClick={() => { setEditingId(word.id); setEditText(word.text) }} className="text-sm px-3">Edit</Button>
                        <Button variant="ghost" onClick={() => setConfirmDeleteId(word.id)} className="text-sm px-3 text-red-600">{BTN_DELETE}</Button>
                      </>
                    )}
                  </div>
                ))}

                {adding === category ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      placeholder={PLACEHOLDER_WORD}
                      aria-label={LABEL_WORD_TEXT}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddWord(category) }}
                      className="flex-1 rounded-xl border-2 border-slate-300 px-4 min-h-12 text-base focus:border-blue-500 focus:outline-none"
                    />
                    <Button variant="secondary" onClick={() => { setAdding(null); setNewText('') }} className="text-sm">{BTN_CANCEL}</Button>
                    <Button onClick={() => handleAddWord(category)} className="text-sm">{BTN_SAVE}</Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => { setAdding(category); setNewText('') }}
                    className="text-sm text-blue-600 self-start"
                    aria-label={`${BTN_ADD_WORD} to ${CATEGORY_LABELS[category]}`}
                  >
                    + {BTN_ADD_WORD}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
