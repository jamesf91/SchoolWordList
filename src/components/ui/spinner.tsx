interface SpinnerProps {
  className?: string
}

export function Spinner({ className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={['h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600', className].join(' ')}
    />
  )
}
