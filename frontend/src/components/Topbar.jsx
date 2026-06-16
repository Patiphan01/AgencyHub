import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import NotificationCenter from './NotificationCenter'

function getPageKey(pathname) {
  const basePath = pathname.split('/')[1] || 'dashboard'
  return basePath
}

function Topbar({ onToggleSidebar }) {
  const location = useLocation()
  const role = localStorage.getItem('agencyhub-role') || 'Owner'
  const { language, t, toggleLanguage } = useLanguage()
  const pageKey = getPageKey(location.pathname)
  const title = t.pages[pageKey] || 'AgencyHub'

  return (
    <header className="topbar">
      <button
        className="mobile-menu-button"
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div>
        <p className="breadcrumb">AgencyHub / {role} / {title}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <NotificationCenter />
        <button
          aria-label={t.languageLabel}
          className="language-toggle"
          onClick={toggleLanguage}
          type="button"
        >
          <span>A/ก</span>
          {language === 'th' ? 'EN' : 'TH'}
        </button>
        <div className="topbar-user">
          <span>{role}</span>
          <div className="avatar">{role.charAt(0)}</div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
