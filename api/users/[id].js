import { handleApiRequest } from '../../backend/src/app.js'

export default async function handler(req, res) {
  req.url = `/api/users/${req.query.id}`
  return handleApiRequest(req, res)
}
