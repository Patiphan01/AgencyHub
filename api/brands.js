import { handleApiRequest } from '../backend/src/app.js'

export default async function handler(req, res) {
  req.url = '/api/brands'
  return handleApiRequest(req, res)
}
