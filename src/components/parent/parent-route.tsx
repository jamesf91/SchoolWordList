import { Navigate, Outlet } from 'react-router-dom'
import { usePinGate } from '@/hooks/use-pin-gate'

export function ParentRoute() {
  const { isUnlocked } = usePinGate()
  return isUnlocked ? <Outlet /> : <Navigate to="/parent/pin" replace />
}
