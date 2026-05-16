import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BTN_START_SESSION, APP_TITLE, MSG_NO_WORDS_BODY } from '@/constants/strings'
import { useDb } from '@/context/db-context'
import { Spinner } from '@/components/ui/spinner'

export default function ChildHome() {
  const navigate = useNavigate()
  const { loading } = useDb()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8 text-center">
      <h1 className="text-4xl font-bold text-sky-800">{APP_TITLE}</h1>
      <p className="text-xl text-slate-500">{MSG_NO_WORDS_BODY}</p>
      <Button
        onClick={() => navigate('/session')}
        className="min-w-64 text-2xl py-6"
      >
        {BTN_START_SESSION}
      </Button>
    </div>
  )
}
