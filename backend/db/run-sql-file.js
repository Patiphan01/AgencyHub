import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) return

    const key = trimmed.slice(0, equalsIndex).trim()
    const rawValue = trimmed.slice(equalsIndex + 1).trim()
    const value = rawValue.replace(/^["']|["']$/g, '')

    if (!process.env[key]) process.env[key] = value
  })
}

function splitSqlStatements(sqlText) {
  const statements = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let previous = ''

  for (const char of sqlText) {
    if (char === "'" && !inDoubleQuote && previous !== '\\') {
      inSingleQuote = !inSingleQuote
    }

    if (char === '"' && !inSingleQuote && previous !== '\\') {
      inDoubleQuote = !inDoubleQuote
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      const statement = current.trim()
      if (statement) statements.push(statement)
      current = ''
    } else {
      current += char
    }

    previous = char
  }

  const statement = current.trim()
  if (statement) statements.push(statement)

  return statements
}

async function main() {
  loadEnvFile(path.join(projectRoot, '.env'))
  loadEnvFile(path.join(projectRoot, '.env.local'))
  loadEnvFile(path.join(projectRoot, '.env.development.local'))

  const databaseUrl = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.Agency_hub_DATABASE_URL ||
    process.env.Agency_hub_POSTGRES_URL ||
    process.env.Agency_hub_DATABASE_URL_UNPOOLED ||
    process.env.Agency_hub_POSTGRES_URL_NON_POOLING
  )
  const inputPath = process.argv[2]

  if (!inputPath) {
    throw new Error('Missing SQL file path. Example: npm run db:migrate')
  }

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL or POSTGRES_URL. Pull/set Vercel env before running this script.')
  }

  const sqlFilePath = path.resolve(projectRoot, inputPath)
  const sqlText = fs.readFileSync(sqlFilePath, 'utf8')
  const statements = splitSqlStatements(sqlText)
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  })

  try {
    for (const [index, statement] of statements.entries()) {
      process.stdout.write(`Running ${index + 1}/${statements.length}...\n`)
      await sql.unsafe(statement)
    }

    process.stdout.write(`Done: ${inputPath}\n`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
