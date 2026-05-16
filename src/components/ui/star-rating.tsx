interface StarRatingProps {
  /** Number of filled stars (1–3) */
  stars: 1 | 2 | 3
  className?: string
}

export function StarRating({ stars, className = '' }: StarRatingProps) {
  return (
    <div className={['flex gap-2', className].join(' ')} aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map(n => (
        <span
          key={n}
          className={['text-4xl', n <= stars ? 'text-yellow-400' : 'text-slate-200'].join(' ')}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}
