import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ChildSession from '../session'
import type { Word } from '@/types'

// ── mock use-revision-session ─────────────────────────────────────────────────
const mockWords: Word[] = [
  { id: 'w1', weekId: 'wk1', text: 'light', category: 'core' },
  { id: 'w2', weekId: 'wk1', text: 'night', category: 'core' },
]
const mockAdvance = vi.fn()
vi.mock('@/hooks/use-revision-session', () => ({
  useRevisionSession: () => ({
    words: mockWords,
    currentIndex: 0,
    advance: mockAdvance,
    isComplete: false,
    loading: false,
  }),
}))

// ── mock use-attempts ─────────────────────────────────────────────────────────
const mockInsertAttempt = vi.fn()
vi.mock('@/hooks/use-attempts', () => ({
  useAttempts: () => ({ insertAttempt: mockInsertAttempt, getWordStats: vi.fn() }),
}))

// ── mock use-tts ──────────────────────────────────────────────────────────────
vi.mock('@/hooks/use-tts', () => ({
  useTts: () => ({ speak: vi.fn(), cancel: vi.fn(), isSpeaking: false, isSupported: true }),
}))

// ── mock child-context ────────────────────────────────────────────────────────
vi.mock('@/context/child-context', () => ({
  useChild: () => ({
    activeChild: { id: 'child-1', name: 'Test Child', createdAt: 0 },
    setActiveChild: vi.fn(),
    clearActiveChild: vi.fn(),
  }),
}))

function setup() {
  return render(
    <MemoryRouter initialEntries={['/session']}>
      <Routes>
        <Route path="/session" element={<ChildSession />} />
        <Route path="/summary" element={<div>Summary</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ChildSession — word text never shown', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does NOT render the word text as a visible DOM text node during the question phase', () => {
    setup()
    // The word "light" must not appear anywhere in the DOM during the question phase
    expect(screen.queryByText('light')).not.toBeInTheDocument()
  })

  it('does NOT render the word text in any input value', () => {
    setup()
    const inputs = document.querySelectorAll('input')
    inputs.forEach(input => {
      expect(input.value).not.toBe('light')
    })
  })
})

describe('ChildSession — ReplayButton always present', () => {
  it('replay button is visible during question phase', () => {
    setup()
    expect(screen.getByRole('button', { name: /replay|hear/i })).toBeInTheDocument()
  })

  it('replay button is visible during result phase', async () => {
    setup()
    // Submit via on-screen keyboard
    for (const letter of ['L', 'I', 'G', 'H', 'T']) {
      await userEvent.click(screen.getByRole('button', { name: letter }))
    }
    await userEvent.click(screen.getByRole('button', { name: /check my answer/i }))
    // After submission, replay button still present
    expect(screen.getByRole('button', { name: /replay|hear/i })).toBeInTheDocument()
  })
})

describe('ChildSession — no native keyboard', () => {
  it('renders no native text input element during question phase', () => {
    setup()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(document.querySelector('input')).toBeNull()
  })
})

describe('ChildSession — attempt recording', () => {
  it('calls insertAttempt with correct=true for right answer', async () => {
    setup()
    for (const letter of ['L', 'I', 'G', 'H', 'T']) {
      await userEvent.click(screen.getByRole('button', { name: letter }))
    }
    await userEvent.click(screen.getByRole('button', { name: /check my answer/i }))
    await waitFor(() => expect(mockInsertAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ wordId: 'w1', correct: true }),
    ))
  })

  it('calls insertAttempt with correct=false for wrong answer', async () => {
    setup()
    for (const letter of ['W', 'R', 'O', 'N', 'G']) {
      await userEvent.click(screen.getByRole('button', { name: letter }))
    }
    await userEvent.click(screen.getByRole('button', { name: /check my answer/i }))
    await waitFor(() => expect(mockInsertAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ wordId: 'w1', correct: false }),
    ))
  })
})
