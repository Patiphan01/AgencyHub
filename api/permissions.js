import { handleApiRequest } from '../backend/src/app.js'

export default async function handler(req, res) {
  req.url = '/api/permissions'
  return handleApiRequest(req, res)
}
