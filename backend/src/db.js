let sqlClient

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

async function getSql() {
  if (!process.env.DATABASE_URL) return null

  if (!sqlClient) {
    const postgres = (await import('postgres')).default
    sqlClient = postgres(process.env.DATABASE_URL, {
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
