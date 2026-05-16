import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTts } from '../use-tts'

// ── SpeechSynthesisUtterance mock (must be a class/constructor) ───────────────
class MockUtterance {
  text: string
  rate = 1
  voice: SpeechSynthesisVoice | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}

let mockSynth: {
  cancel: ReturnType<typeof vi.fn>
  speak: ReturnType<typeof vi.fn>
  getVoices: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
}
let lastUtterance: MockUtterance | null = null

beforeEach(() => {
  lastUtterance = null
  mockSynth = {
    cancel: vi.fn(),
    speak: vi.fn((u: MockUtterance) => { lastUtterance = u }),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', mockSynth)
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
})

describe('useTts', () => {
  it('isSupported is true when speechSynthesis exists', () => {
    const { result } = renderHook(() => useTts())
    expect(result.current.isSupported).toBe(true)
  })

  it('isSupported is false when speechSynthesis is undefined', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useTts())
    expect(result.current.isSupported).toBe(false)
  })

  it('isSpeaking transitions false → true on speak, → false on onend', () => {
    const { result } = renderHook(() => useTts())
    expect(result.current.isSpeaking).toBe(false)

    act(() => result.current.speak('light'))
    act(() => { lastUtterance?.onstart?.() })
    expect(result.current.isSpeaking).toBe(true)

    act(() => { lastUtterance?.onend?.() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('calls cancel before speak (iOS queue prevention)', () => {
    const { result } = renderHook(() => useTts())
    const cancelOrder: string[] = []
    mockSynth.cancel.mockImplementation(() => cancelOrder.push('cancel'))
    mockSynth.speak.mockImplementation((u: MockUtterance) => {
      lastUtterance = u
      cancelOrder.push('speak')
    })
    act(() => result.current.speak('light'))
    expect(cancelOrder[0]).toBe('cancel')
    expect(cancelOrder[1]).toBe('speak')
  })

  it('cancel() resets isSpeaking', () => {
    const { result } = renderHook(() => useTts())
    act(() => result.current.speak('light'))
    act(() => { lastUtterance?.onstart?.() })
    expect(result.current.isSpeaking).toBe(true)
    act(() => result.current.cancel())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('calls cancel on unmount', () => {
    const { unmount } = renderHook(() => useTts())
    unmount()
    expect(mockSynth.cancel).toHaveBeenCalled()
  })

  it('isSpeaking becomes false on onerror', () => {
    const { result } = renderHook(() => useTts())
    act(() => result.current.speak('light'))
    act(() => { lastUtterance?.onstart?.() })
    act(() => { lastUtterance?.onerror?.() })
    expect(result.current.isSpeaking).toBe(false)
  })
})
