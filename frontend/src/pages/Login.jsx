import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getRoles, loginSession, setCachedSession } from '../services/apiClient'

const fallbackRoles = ['Brand', 'Owner', 'Staff']

const roleLabels = {
  Brand: 'แบรนด์',
  Owner: 'หัวหน้า',
  Staff: 'พนักงาน',
}

function Login() {
  const [selectedRole, setSelectedRole] = useState('Owner')
  const [roles, setRoles] = useState(fallbackRoles)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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

  async function handleLogin(event) {
    event.preventDefault()
    if (isLoggingIn) return

    const formData = new FormData(event.currentTarget)

    try {
      setIsLoggingIn(true)
      const session = await loginSession({
        username: formData.get('username') || selectedRole,
        password: formData.get('password'),
        role: selectedRole,
      })
      const user = session.user
      localStorage.setItem('agencyhub-role', user.role || selectedRole)
      localStorage.setItem('agencyhub-user-id', user.id)
      localStorage.setItem('agencyhub-permissions', JSON.stringify(user.permissions || []))
      setCachedSession(session)
      navigate('/dashboard')
    } catch (error) {
      alert(`เข้าสู่ระบบไม่ได้: ${error.message}`)
    } finally {
      setIsLoggingIn(false)
    }
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

          <button className="login-button" disabled={isLoggingIn} type="submit">
            {isLoggingIn ? 'Logging in...' : t.login}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
