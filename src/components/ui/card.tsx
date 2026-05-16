import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={['rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
