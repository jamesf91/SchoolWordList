import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWords } from '@/hooks/use-words'
import { useWeeks } from '@/hooks/use-weeks'
import { useDb } from '@/context/db-context'
import { fetchExampleSentence } from '@/lib/fetch-example'
import { getExample, setExample } from '@/db/examples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  BTN_ADD_WORD, BTN_SAVE, BTN_CANCEL, BTN_DELETE,
  LABEL_WORD_TEXT, PLACEHOLDER_WORD,
  CATEGORY_LABELS, MSG_DELETE_WORD_CONFIRM, MSG_NO_WORDS_IN_WEEK, BTN_BACK,
  LABEL_EXAMPLE_SENTENCE, PLACEHOLDER_EXAMPLE_SENTENCE, MSG_EXAMPLE_MISSING_WORD,
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
  const [editExample, setEditExample] = useState('')
  const [editExampleError, setEditExampleError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [examples, setExamples] = useState<Record<string, string>>({})

  const { db } = useDb()
  const week = weeks.find(w => w.id === weekId)

  useEffect(() => {
    if (!db || words.length === 0) return
    Promise.all(
      words.map(w => getExample(db, w.id).then(sentence => ({ id: w.id, sentence })))
    ).then(results => {
      const map: Record<string, string> = {}
      for (const { id, sentence } of results) {
        if (sentence) map[id] = sentence
      }
      setExamples(map)
    })
  }, [db, words])

  if (!week) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>

  function cacheExample(wordId: string, text: string, customSentence?: string) {
    if (!db) return
    if (customSentence !== undefined) {
      const sentence = customSentence.trim()
      if (sentence) {
        setExample(db, wordId, sentence).then(() =>
          setExamples(prev => ({ ...prev, [wordId]: sentence }))
        )
      }
      return
    }
    fetchExampleSentence(text).then(sentence => {
      if (sentence && db) {
        setExample(db, wordId, sentence).then(() =>
          setExamples(prev => ({ ...prev, [wordId]: sentence }))
        )
      }
    })
  }

  async function handleAddWord(category: WordCategory) {
    if (!newText.trim() || !weekId) return
    const texts = newText.split(',').map(w => w.trim()).filter(Boolean)
    const newWords = texts.map(text => ({ id: nanoid(), weekId, text, category }))
    await Promise.all(newWords.map(w => upsertWord(w)))
    newWords.forEach(w => cacheExample(w.id, w.text))
    setNewText('')
    setAdding(null)
  }

  async function handleEditSave(word: Word) {
    if (!editText.trim()) return

    const exampleValue = editExample.trim()
    if (exampleValue) {
      const wordLower = editText.trim().toLowerCase()
      if (!exampleValue.toLowerCase().includes(wordLower)) {
        setEditExampleError(MSG_EXAMPLE_MISSING_WORD(editText.trim()))
        return
      }
    }

    await upsertWord({ ...word, text: editText.trim() })
    if (exampleValue) {
      cacheExample(word.id, editText.trim(), exampleValue)
    } else if (editText.trim() !== word.text) {
      cacheExample(word.id, editText.trim())
    }
    setEditingId(null)
    setEditExampleError('')
  }

  function startEditing(word: Word) {
    setEditingId(word.id)
    setEditText(word.text)
    setEditExample(examples[word.id] ?? '')
    setEditExampleError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditExampleError('')
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
                  <div key={word.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    {editingId === word.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            aria-label={LABEL_WORD_TEXT}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:outline-none focus:border-blue-500"
                          />
                          <Button variant="secondary" onClick={cancelEditing} className="text-sm px-3">{BTN_CANCEL}</Button>
                          <Button onClick={() => handleEditSave(word)} className="text-sm px-3">{BTN_SAVE}</Button>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500">{LABEL_EXAMPLE_SENTENCE}</label>
                          <input
                            value={editExample}
                            onChange={e => { setEditExample(e.target.value); setEditExampleError('') }}
                            placeholder={PLACEHOLDER_EXAMPLE_SENTENCE}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                          {editExampleError && (
                            <p className="text-xs text-amber-600">{editExampleError}</p>
                          )}
                        </div>
                      </div>
                    ) : confirmDeleteId === word.id ? (
                      <div className="flex items-center gap-2">
                        <p className="flex-1 text-sm text-slate-600">{MSG_DELETE_WORD_CONFIRM(word.text)}</p>
                        <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} className="text-sm px-3">{BTN_CANCEL}</Button>
                        <Button variant="destructive" onClick={() => handleDelete(word.id)} className="text-sm px-3">{BTN_DELETE}</Button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-base font-medium text-slate-800">{word.text}</span>
                          {examples[word.id] ? (
                            <p className="mt-0.5 text-sm text-slate-500 italic">{examples[word.id]}</p>
                          ) : (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              No example sentence
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" onClick={() => startEditing(word)} className="text-sm px-3 shrink-0">Edit</Button>
                        <Button variant="ghost" onClick={() => setConfirmDeleteId(word.id)} className="text-sm px-3 text-red-600 shrink-0">{BTN_DELETE}</Button>
                      </div>
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
