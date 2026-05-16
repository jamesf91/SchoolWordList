import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ResultPanel } from '../result-panel'

describe('ResultPanel — correct answer', () => {
  it('shows celebration text', () => {
    render(<ResultPanel correct={true} correctSpelling="light" onNext={vi.fn()} />)
    // At least one of the celebration messages should appear
    const el = document.querySelector('.text-green-600')
    expect(el).toBeTruthy()
  })

  it('does not show any red colour classes', () => {
    const { container } = render(<ResultPanel correct={true} correctSpelling="light" onNext={vi.fn()} />)
    expect(container.innerHTML).not.toMatch(/text-red|bg-red|border-red/)
  })

  it('does not render an X character', () => {
    const { container } = render(<ResultPanel correct={true} correctSpelling="light" onNext={vi.fn()} />)
    expect(container.textContent).not.toContain('✗')
    expect(container.textContent).not.toContain('✕')
    expect(container.textContent).not.toContain('×')
  })
})

describe('ResultPanel — incorrect answer', () => {
  it('shows the correct spelling', () => {
    render(<ResultPanel correct={false} correctSpelling="light" onNext={vi.fn()} />)
    expect(screen.getByText('light')).toBeInTheDocument()
  })

  it('does not show any red colour classes', () => {
    const { container } = render(<ResultPanel correct={false} correctSpelling="light" onNext={vi.fn()} />)
    expect(container.innerHTML).not.toMatch(/text-red|bg-red|border-red/)
  })

  it('does not render an X character', () => {
    const { container } = render(<ResultPanel correct={false} correctSpelling="light" onNext={vi.fn()} />)
    expect(container.textContent).not.toContain('✗')
    expect(container.textContent).not.toContain('✕')
    expect(container.textContent).not.toContain('×')
  })
})

describe('ResultPanel — next button', () => {
  it('calls onNext when Next button is clicked', async () => {
    const onNext = vi.fn()
    render(<ResultPanel correct={true} correctSpelling="light" onNext={onNext} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
