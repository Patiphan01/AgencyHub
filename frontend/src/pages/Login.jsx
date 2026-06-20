import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getRoles } from '../services/apiClient'

const fallbackRoles = ['Brand', 'Owner', 'Staff']

const roleLabels = {
  Brand: 'แบรนด์',
  Owner: 'หัวหน้า',
  Staff: 'พนักงาน',
}

function Login() {
  const [selectedRole, setSelectedRole] = useState('Owner')
  const [roles, setRoles] = useState(fallbackRoles)
  const navigate = useNavigate()
  const { language, t, toggleLanguage } = useLanguage()

  useEffect(() => {
    let cancelled = false

    getRoles()
      .then((data) => {
        const values = data.map((role) => (typeof role === 'string' ? role : role.name)).filter(Boolean)
        if (!cancelled && values.length) setRoles(values)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  function handleLogin(event) {
    event.preventDefault()
    localStorage.setItem('agencyhub-role', selectedRole)
    navigate('/dashboard')
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <button
          aria-label={t.languageLabel}
          className="language-toggle login-language-toggle"
          onClick={toggleLanguage}
          type="button"
        >
          <span>A/ก</span>
          {language === 'th' ? 'EN' : 'TH'}
        </button>

        <div className="login-brand">
          <div className="logo-mark large">A</div>
          <div>
            <h1>AgencyHub</h1>
            <p>{t.appSubtitle}</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label>
            {t.username}
            <input name="username" placeholder="owner" />
          </label>
          <label>
            {t.password}
            <input name="password" type="password" placeholder="••••••••" />
          </label>

          <div>
            <p className="form-hint">{t.demoRole}</p>
            <div className="role-picker" aria-label="Demo role options">
              {roles.map((role) => (
                <button
                  className={selectedRole === role ? 'role-option active' : 'role-option'}
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  type="button"
                >
                  {roleLabels[role] || role}
                </button>
              ))}
            </div>
          </div>

          <button className="login-button" type="submit">{t.login}</button>
        </form>
      </section>
    </main>
  )
}

export default Login
