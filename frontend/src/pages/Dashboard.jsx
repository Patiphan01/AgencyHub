import BrandDashboard from './dashboards/BrandDashboard'
import OwnerDashboard from './dashboards/OwnerDashboard'
import StaffDashboard from './dashboards/StaffDashboard'

function Dashboard() {
  const role = localStorage.getItem('agencyhub-role') || 'Owner'

  if (role === 'Brand') {
    return <BrandDashboard />
  }

  if (role === 'Staff') {
    return <StaffDashboard />
  }

  return <OwnerDashboard />
}

export default Dashboard
