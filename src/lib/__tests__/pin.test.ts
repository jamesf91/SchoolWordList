import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  hashPin,
  verifyPin,
  savePinHash,
  loadPinHash,
  setSessionUnlocked,
  isSessionUnlocked,
  clearSession,
} from '../pin'

// jsdom doesn't implement crypto.subtle — use Node's implementation
import { webcrypto } from 'crypto'
vi.stubGlobal('crypto', webcrypto)

describe('hashPin', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await hashPin('1234')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same PIN', async () => {
    expect(await hashPin('1234')).toBe(await hashPin('1234'))
  })

  it('produces different hashes for different PINs', async () => {
    expect(await hashPin('1234')).not.toBe(await hashPin('5678'))
  })
})

describe('verifyPin', () => {
  it('returns true when PIN matches stored hash', async () => {
    const hash = await hashPin('9999')
    expect(await verifyPin('9999', hash)).toBe(true)
  })

  it('returns false when PIN does not match', async () => {
    const hash = await hashPin('9999')
    expect(await verifyPin('0000', hash)).toBe(false)
  })
})

describe('localStorage PIN persistence', () => {
  beforeEach(() => localStorage.clear())

  it('savePinHash / loadPinHash round-trips', () => {
    savePinHash('abc123')
    expect(loadPinHash()).toBe('abc123')
  })

  it('loadPinHash returns null when nothing saved', () => {
    expect(loadPinHash()).toBeNull()
  })
})

describe('session unlock', () => {
  beforeEach(() => sessionStorage.clear())

  it('isSessionUnlocked is false before setSessionUnlocked', () => {
    expect(isSessionUnlocked()).toBe(false)
  })

  it('isSessionUnlocked is true immediately after setSessionUnlocked', () => {
    setSessionUnlocked()
    expect(isSessionUnlocked()).toBe(true)
  })

  it('clearSession makes isSessionUnlocked false', () => {
    setSessionUnlocked()
    clearSession()
    expect(isSessionUnlocked()).toBe(false)
  })

  it('isSessionUnlocked is false when timestamp is too old', () => {
    const oldTs = Date.now() - 5 * 60 * 60 * 1000 // 5 hours ago
    sessionStorage.setItem('sp_ul', String(oldTs))
    expect(isSessionUnlocked()).toBe(false)
  })
})
