import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { getHealthStatus } from './services/apiClient'
import './styles/globals.css'

function App() {
  useEffect(() => {
    getHealthStatus().catch(() => undefined)
  }, [])

  return <AppRoutes />
}

export default App
