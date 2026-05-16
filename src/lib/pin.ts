import { SESSION_UNLOCK_HOURS } from '@/constants/config'

// Security posture: SHA-256 + static salt is intentional.
// Threat model is child discovery, not adversarial cracking.
// A parent PIN does not protect high-value secrets — it just gates the UI.
const SALT = 'spelling-app-v1'
const LS_PIN_KEY = 'sp_ph'
const SS_UNLOCK_KEY = 'sp_ul'

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + pin)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}

export function savePinHash(hash: string): void {
  localStorage.setItem(LS_PIN_KEY, hash)
}

export function loadPinHash(): string | null {
  return localStorage.getItem(LS_PIN_KEY)
}

export function setSessionUnlocked(): void {
  sessionStorage.setItem(SS_UNLOCK_KEY, String(Date.now()))
}

export function isSessionUnlocked(): boolean {
  const raw = sessionStorage.getItem(SS_UNLOCK_KEY)
  if (raw === null) return false
  const ts = parseInt(raw, 10)
  const ageHours = (Date.now() - ts) / (1000 * 60 * 60)
  return ageHours < SESSION_UNLOCK_HOURS
}

export function clearSession(): void {
  sessionStorage.removeItem(SS_UNLOCK_KEY)
}
