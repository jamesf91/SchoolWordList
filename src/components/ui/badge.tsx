import type { WordCategory } from '@/types'
import { CATEGORY_LABELS } from '@/constants/strings'

const categoryClasses: Record<WordCategory, string> = {
  core: 'bg-blue-100 text-blue-800',
  tricky: 'bg-amber-100 text-amber-800',
  extension: 'bg-purple-100 text-purple-800',
}

interface BadgeProps {
  category: WordCategory
  className?: string
}

export function Badge({ category, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        categoryClasses[category],
        className,
      ].join(' ')}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
