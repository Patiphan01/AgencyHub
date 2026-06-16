import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import BrandDetail from '../pages/BrandDetail'
import Brands from '../pages/Brands'
import CampaignDetail from '../pages/CampaignDetail'
import Campaigns from '../pages/Campaigns'
import Clients from '../pages/Clients'
import Dashboard from '../pages/Dashboard'
import Invoices from '../pages/Invoices'
import Influencers from '../pages/Influencers'
import Login from '../pages/Login'
import Projects from '../pages/Projects'
import Settings from '../pages/Settings'
import Tasks from '../pages/Tasks'
import Users from '../pages/Users'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/brands/:brandId" element={<BrandDetail />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
        <Route path="/influencers" element={<Influencers />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
