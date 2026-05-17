import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SpellingInput } from '../spelling-input'

describe('SpellingInput (OnScreenKeyboard)', () => {
  it('renders no native input element', () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('display area has aria-live polite', () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    const display = screen.getByRole('status')
    expect(display).toHaveAttribute('aria-live', 'polite')
  })

  it('clicking letter buttons appends lowercase by default', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'L' }))
    await userEvent.click(screen.getByRole('button', { name: 'I' }))
    await userEvent.click(screen.getByRole('button', { name: 'G' }))
    expect(screen.getByRole('status')).toHaveTextContent('lig')
  })

  it('shift toggles to uppercase and back', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Shift' }))
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByRole('status')).toHaveTextContent('A')
    await userEvent.click(screen.getByRole('button', { name: 'Shift' }))
    await userEvent.click(screen.getByRole('button', { name: 'B' }))
    expect(screen.getByRole('status')).toHaveTextContent('Ab')
  })

  it('special char buttons append their character', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: '-' }))
    await userEvent.click(screen.getByRole('button', { name: '_' }))
    await userEvent.click(screen.getByRole('button', { name: "'" }))
    await userEvent.click(screen.getByRole('button', { name: 'Space' }))
    // Use textContent directly to preserve trailing space
    expect(screen.getByRole('status').textContent).toBe("-_' ")
  })

  it('backspace removes the last character', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'C' }))
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    await userEvent.click(screen.getByRole('button', { name: 'T' }))
    await userEvent.click(screen.getByRole('button', { name: 'Backspace' }))
    expect(screen.getByRole('status')).toHaveTextContent('ca')
  })

  it('clear empties the display', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'D' }))
    await userEvent.click(screen.getByRole('button', { name: 'O' }))
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByRole('status')).not.toHaveTextContent('do')
  })

  it('submit button is disabled when display is empty', () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /check my answer/i })).toBeDisabled()
  })

  it('submit calls onSubmit with accumulated value', async () => {
    const onSubmit = vi.fn()
    render(<SpellingInput onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'N' }))
    await userEvent.click(screen.getByRole('button', { name: 'I' }))
    await userEvent.click(screen.getByRole('button', { name: 'G' }))
    await userEvent.click(screen.getByRole('button', { name: 'H' }))
    await userEvent.click(screen.getByRole('button', { name: 'T' }))
    await userEvent.click(screen.getByRole('button', { name: /check my answer/i }))
    expect(onSubmit).toHaveBeenCalledWith('night')
  })

  it('key prop remount resets the display', async () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<SpellingInput key={0} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByRole('status').textContent).toBe('a')
    rerender(<SpellingInput key={1} onSubmit={onSubmit} />)
    expect(screen.getByRole('status').textContent).not.toBe('a')
  })

  it('physical keyboard letters append to display', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.keyboard('cat')
    expect(screen.getByRole('status')).toHaveTextContent('cat')
  })

  it('physical backspace removes last character', async () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    await userEvent.keyboard('dog')
    await userEvent.keyboard('{Backspace}')
    expect(screen.getByRole('status')).toHaveTextContent('do')
    expect(screen.getByRole('status')).not.toHaveTextContent('dog')
  })
})
