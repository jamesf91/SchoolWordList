import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import {
  SUMMARY_TITLE,
  SUMMARY_SCORE,
  SUMMARY_PERFECT,
  SUMMARY_ENCOURAGE,
  BTN_START_SESSION,
  BTN_FINISH_SESSION,
} from '@/constants/strings'

interface SummaryState {
  correct: number
  total: number
}

function starsForScore(correct: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const pct = correct / total
  if (pct >= 0.8) return 3
  if (pct >= 0.5) return 2
  return 1
}

export default function ChildSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? { correct: 0, total: 0 }) as SummaryState
  const { correct, total } = state
  const stars = starsForScore(correct, total)
  const isPerfect = correct === total && total > 0

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8 text-center">
      <h1 className="text-4xl font-bold text-sky-800">{SUMMARY_TITLE}</h1>

      <StarRating stars={stars} />

      <p className="text-2xl font-medium text-slate-700">{SUMMARY_SCORE(correct, total)}</p>

      <p className="text-xl text-slate-500">
        {isPerfect ? SUMMARY_PERFECT : SUMMARY_ENCOURAGE}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={() => navigate('/session')} className="w-full text-xl py-4">
          {BTN_START_SESSION}
        </Button>
        <Button onClick={() => navigate('/')} variant="secondary" className="w-full text-xl py-4">
          {BTN_FINISH_SESSION}
        </Button>
      </div>
    </div>
  )
}
