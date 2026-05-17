import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ProfilePicker } from '@/components/child/profile-picker'
import { BTN_START_SESSION, APP_TITLE, MSG_NO_WORDS_BODY } from '@/constants/strings'
import { useDb } from '@/context/db-context'
import { useChild } from '@/context/child-context'
import { useChildProfile } from '@/hooks/use-child-profile'
import { getAllWords } from '@/db/words'

export default function ChildHome() {
  const navigate = useNavigate()
  const { db, loading } = useDb()
  const { activeChild, setActiveChild } = useChild()
  const { profiles } = useChildProfile()
  const [hasWords, setHasWords] = useState(false)
  const [wordsLoading, setWordsLoading] = useState(true)

  useEffect(() => {
    if (!db) return
    getAllWords(db).then(words => {
      setHasWords(words.length > 0)
      setWordsLoading(false)
    })
  }, [db])

  if (loading || wordsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Show profile picker when multiple profiles exist and none is selected
  if (!activeChild && profiles.length > 1) {
    return <ProfilePicker profiles={profiles} onSelect={setActiveChild} />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8 text-center">
      <h1 className="select-none text-5xl font-bold text-sky-800" aria-label={activeChild ? `Hi ${activeChild.name}! Ready to practise?` : APP_TITLE}>
        {activeChild ? (
          <>
            <span onDoubleClick={() => navigate('/parent/pin')} className="cursor-default">Hi</span>
            {` ${activeChild.name}! Ready to practise?`}
          </>
        ) : APP_TITLE}
      </h1>

      {!hasWords && (
        <p className="text-xl text-slate-500">{MSG_NO_WORDS_BODY}</p>
      )}

      <Button
        onClick={() => navigate('/session')}
        disabled={!hasWords}
        className="min-w-64 py-6 text-2xl"
      >
        {BTN_START_SESSION}
      </Button>
    </div>
  )
}
