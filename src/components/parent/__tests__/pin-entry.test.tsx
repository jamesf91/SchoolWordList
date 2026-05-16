import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PinEntry } from '../pin-entry'

const mockUnlock = vi.fn()
vi.mock('@/hooks/use-pin-gate', () => ({
  usePinGate: () => ({ isUnlocked: false, unlock: mockUnlock, lock: vi.fn() }),
}))
vi.mock('@/lib/pin', () => ({
  loadPinHash: () => 'stored-hash',
}))

function setup() {
  return render(
    <MemoryRouter initialEntries={['/parent/pin']}>
      <Routes>
        <Route path="/parent/pin" element={<PinEntry />} />
        <Route path="/parent/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function getPinInputs() {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[type="password"]'))
}

describe('PinEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders 4 PIN digit inputs', () => {
    setup()
    expect(getPinInputs()).toHaveLength(4)
  })

  it('navigates to dashboard on correct PIN', async () => {
    mockUnlock.mockResolvedValue(true)
    setup()
    for (const [i, inp] of getPinInputs().entries()) {
      await userEvent.type(inp, String(i + 1))
    }
    await userEvent.click(screen.getByRole('button', { name: /unlock/i }))
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })

  it('shows error alert and does not navigate on wrong PIN', async () => {
    mockUnlock.mockResolvedValue(false)
    setup()
    for (const inp of getPinInputs()) {
      await userEvent.type(inp, '0')
    }
    await userEvent.click(screen.getByRole('button', { name: /unlock/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('clears all digit inputs after wrong PIN', async () => {
    mockUnlock.mockResolvedValue(false)
    setup()
    for (const inp of getPinInputs()) {
      await userEvent.type(inp, '9')
    }
    await userEvent.click(screen.getByRole('button', { name: /unlock/i }))
    await waitFor(() => {
      getPinInputs().forEach(inp => expect(inp.value).toBe(''))
    })
  })
})
