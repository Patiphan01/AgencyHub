import { createServer } from 'node:http'
import { handleApiRequest } from './src/app.js'

const port = Number.parseInt(process.env.PORT || '3001', 10)

const server = createServer((req, res) => {
  handleApiRequest(req, res)
})

server.listen(port, () => {
  console.log(`AgencyHub backend listening on http://localhost:${port}`)
})
