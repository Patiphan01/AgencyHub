import { handleApiRequest } from '../backend/src/app.js'

export default async function handler(req, res) {
  return handleApiRequest(req, res)
}
