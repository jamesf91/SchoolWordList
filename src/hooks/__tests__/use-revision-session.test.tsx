import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRevisionSession } from '../use-revision-session'
import type { Week, Word, Attempt } from '@/types'

// vi.mock factories are hoisted — use vi.fn() with no args; wire return values in beforeEach
vi.mock('@/context/db-context', () => ({
  useDb: () => ({ db: {}, loading: false, error: null }),
}))
vi.mock('@/db/weeks', () => ({ getAllWeeks: vi.fn() }))
vi.mock('@/db/words', () => ({ getAllWords: vi.fn() }))
vi.mock('@/db/attempts', () => ({ getAllAttempts: vi.fn() }))

// Import after mocks are registered
import { getAllWeeks } from '@/db/weeks'
import { getAllWords } from '@/db/words'
import { getAllAttempts } from '@/db/attempts'

const testWeeks: Week[] = [{ id: 'wk1', weekNumber: 1, focusSound: 'igh', createdAt: 0 }]
const testWords: Word[] = [
  { id: 'w1', weekId: 'wk1', text: 'light', category: 'core' },
  { id: 'w2', weekId: 'wk1', text: 'night', category: 'core' },
  { id: 'w3', weekId: 'wk1', text: 'sight', category: 'tricky' },
]
const testAttempts: Attempt[] = []

describe('useRevisionSession', () => {
  beforeEach(() => {
    vi.mocked(getAllWeeks).mockResolvedValue(testWeeks)
    vi.mocked(getAllWords).mockResolvedValue(testWords)
    vi.mocked(getAllAttempts).mockResolvedValue(testAttempts)
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useRevisionSession())
    expect(result.current.loading).toBe(true)
  })

  it('resolves words from buildRevisionList on mount', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.words.length).toBeGreaterThan(0)
    expect(result.current.words.length).toBeLessThanOrEqual(10)
  })

  it('all returned words come from the known pool', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const wordIds = new Set(testWords.map(w => w.id))
    result.current.words.forEach(w => expect(wordIds.has(w.id)).toBe(true))
  })

  it('word list does not change after initial mount (stable mid-session)', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const initial = result.current.words.map(w => w.id)
    act(() => {})
    expect(result.current.words.map(w => w.id)).toEqual(initial)
  })

  it('starts at index 0', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.currentIndex).toBe(0)
  })

  it('advance() increments currentIndex', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.advance())
    expect(result.current.currentIndex).toBe(1)
  })

  it('isComplete becomes true when advance reaches end', async () => {
    const { result } = renderHook(() => useRevisionSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const total = result.current.words.length
    for (let i = 0; i < total; i++) {
      act(() => result.current.advance())
    }
    expect(result.current.isComplete).toBe(true)
  })
})
