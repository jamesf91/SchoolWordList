import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SpellingInput } from '../spelling-input'

describe('SpellingInput', () => {
  it('has autoCorrect, autoCapitalize, autoComplete off and spellCheck false', () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autocorrect', 'off')
    expect(input).toHaveAttribute('autocapitalize', 'off')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('spellcheck', 'false')
  })

  it('calls onSubmit with trimmed value on Enter key', async () => {
    const onSubmit = vi.fn()
    render(<SpellingInput onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '  light  {Enter}')
    expect(onSubmit).toHaveBeenCalledWith('light')
  })

  it('calls onSubmit with trimmed value on button click', async () => {
    const onSubmit = vi.fn()
    render(<SpellingInput onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'night')
    await userEvent.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalledWith('night')
  })

  it('does not call onSubmit when input is empty', async () => {
    const onSubmit = vi.fn()
    render(<SpellingInput onSubmit={onSubmit} />)
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('resets value between word changes via key prop', async () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<SpellingInput key={0} onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'light')
    expect(input).toHaveValue('light')
    // Remount with new key simulates word change
    rerender(<SpellingInput key={1} onSubmit={onSubmit} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('has minimum font size via class', () => {
    render(<SpellingInput onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox')
    expect(input.className).toMatch(/text-2xl|text-3xl|text-4xl/)
  })
})
