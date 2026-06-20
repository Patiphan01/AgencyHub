import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let sqlClient

function loadLocalEnv() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const projectRoot = path.resolve(__dirname, '../..')
  const envFiles = ['.env', '.env.local', '.env.development.local']

  envFiles.forEach((fileName) => {
    const filePath = path.join(projectRoot, fileName)
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
  })
}

loadLocalEnv()

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.Agency_hub_DATABASE_URL ||
    process.env.Agency_hub_POSTGRES_URL ||
    process.env.Agency_hub_DATABASE_URL_UNPOOLED ||
    process.env.Agency_hub_POSTGRES_URL_NON_POOLING
  )
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl())
}

export async function getSql() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) return null

  if (!sqlClient) {
    const postgres = (await import('postgres')).default
    sqlClient = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }

  return sqlClient
}

export async function getDatabaseStatus() {
  if (!hasDatabaseUrl()) {
    return {
      configured: false,
      connected: false,
      provider: 'postgres',
      message: 'DATABASE_URL is not configured. API is using mock seed data.',
    }
  }

  const sql = await getSql()
  await sql`select 1 as ok`

  return {
    configured: true,
    connected: true,
    provider: 'postgres',
  }
}

export async function listRows(tableName) {
  const sql = await getSql()
  if (!sql) return null

  return sql`select * from ${sql(tableName)} order by id`
}

export async function getRowById(tableName, id) {
  const sql = await getSql()
  if (!sql) return null

  const rows = await sql`select * from ${sql(tableName)} where id = ${id} limit 1`
  return rows[0] || null
}

export async function getDashboardRows() {
  const sql = await getSql()
  if (!sql) return null

  const [brandRows, campaignRows, influencerRows, tierRows] = await Promise.all([
    sql`select * from brands order by id`,
    sql`select * from campaigns order by id`,
    sql`select * from influencers order by id`,
    sql`select * from tier_targets order by id`,
  ])

  return {
    brands: brandRows,
    campaigns: campaignRows,
    influencers: influencerRows,
    tierTargets: tierRows,
  }
}

export async function updateInfluencer(id, values) {
  const sql = await getSql()
  if (!sql) return null

  const allowedFields = {
    status: 'status',
    draft: 'draft',
    draftStatus: 'draft_status',
    productSent: 'product_sent',
    postDate: 'post_date',
    postLink: 'post_link',
    assetLink: 'asset_link',
    bank: 'bank',
    seniorApproval: 'senior_approval',
  }

  const updates = Object.entries(values)
    .filter(([key]) => Object.hasOwn(allowedFields, key))
    .map(([key, value]) => ({ column: allowedFields[key], value }))

  if (!updates.length) {
    const rows = await sql`select * from influencers where id = ${id} limit 1`
    return rows[0] || null
  }

  const updateObject = Object.fromEntries(updates.map(({ column, value }) => [column, value]))
  const rows = await sql`
    update influencers
    set ${sql(updateObject)}, updated_at = now()
    where id = ${id}
    returning *
  `

  return rows[0] || null
}
