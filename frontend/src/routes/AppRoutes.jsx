import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import MockupDashboard from '../pages/MockupDashboard'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<MockupDashboard />} />
      <Route path="/brands/*" element={<MockupDashboard />} />
      <Route path="/campaigns/*" element={<MockupDashboard />} />
      <Route path="/influencers" element={<MockupDashboard />} />
      <Route path="/clients" element={<MockupDashboard />} />
      <Route path="/projects" element={<MockupDashboard />} />
      <Route path="/tasks" element={<MockupDashboard />} />
      <Route path="/invoices" element={<MockupDashboard />} />
      <Route path="/settings" element={<MockupDashboard />} />
      <Route path="/users" element={<MockupDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
