import { handleApiRequest } from '../backend/src/app.js'

export default async function handler(req, res) {
  const path = req.query?.path
  const parts = Array.isArray(path) ? path : path ? [path] : []

  if (parts.length) {
    const query = new URLSearchParams()
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'path') return
      if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
      else if (value !== undefined) query.set(key, value)
    })

    req.url = `/api/${parts.join('/')}${query.size ? `?${query.toString()}` : ''}`
  }

  return handleApiRequest(req, res)
}
