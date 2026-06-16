import { NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const navigationByRole = {
  Owner: [
    { to: '/dashboard', labelKey: 'dashboard' },
    { to: '/brands', labelKey: 'brands' },
    { to: '/campaigns', labelKey: 'campaigns' },
    { to: '/clients', labelKey: 'clients' },
    { to: '/projects', labelKey: 'projects' },
    { to: '/tasks', labelKey: 'tasks' },
    { to: '/invoices', labelKey: 'invoices' },
    { to: '/users', labelKey: 'users' },
    { to: '/settings', labelKey: 'settings' },
  ],
  Staff: [
    { to: '/dashboard', labelKey: 'dashboard' },
    { to: '/campaigns', labelKey: 'assignedCampaigns' },
    { to: '/influencers', labelKey: 'influencers' },
    { to: '/tasks', labelKey: 'tasks' },
    { to: '/projects', labelKey: 'projects' },
    { to: '/settings', labelKey: 'settings' },
  ],
  Brand: [
    { to: '/dashboard', labelKey: 'dashboard' },
    { to: '/campaigns', labelKey: 'campaignProgress' },
    { to: '/influencers', labelKey: 'influencerSelection' },
    { to: '/tasks', labelKey: 'contentStatus' },
    { to: '/settings', labelKey: 'settings' },
  ],
}

function Sidebar() {
  const role = localStorage.getItem('agencyhub-role') || 'Owner'
  const links = navigationByRole[role] || navigationByRole.Owner
  const navigate = useNavigate()
  const { t } = useLanguage()

  function handleLogout() {
    localStorage.removeItem('agencyhub-role')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-block">
          <div className="logo-mark">A</div>
          <div>
            <strong>AgencyHub</strong>
            <span>Influencer CRM</span>
          </div>
        </div>
        <div className="role-chip">{role} {t.view}</div>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              key={link.to}
              to={link.to}
            >
              {t.nav[link.labelKey]}
            </NavLink>
          ))}
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout} type="button">
        <span>⇤</span>
        {t.logout}
      </button>
    </aside>
  )
}

export default Sidebar
