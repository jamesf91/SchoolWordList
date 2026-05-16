import { Navigate, Route, Routes } from 'react-router-dom'
import { ParentRoute } from '@/components/parent/parent-route'
import { PinEntry } from '@/components/parent/pin-entry'
import ChildHome from '@/pages/child/home'
import ChildSession from '@/pages/child/session'
import ChildSummary from '@/pages/child/summary'
import ParentDashboard from '@/pages/parent/dashboard'
import WeekNew from '@/pages/parent/week-new'
import WeekDetail from '@/pages/parent/week-detail'
import ParentProgress from '@/pages/parent/progress'
import ParentSettings from '@/pages/parent/settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChildHome />} />
      <Route path="/session" element={<ChildSession />} />
      <Route path="/summary" element={<ChildSummary />} />

      <Route path="/parent" element={<ParentRoute />}>
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="weeks/new" element={<WeekNew />} />
        <Route path="weeks/:weekId" element={<WeekDetail />} />
        <Route path="progress" element={<ParentProgress />} />
        <Route path="settings" element={<ParentSettings />} />
      </Route>
      <Route path="/parent/pin" element={<PinEntry />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
