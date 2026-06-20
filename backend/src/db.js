let sqlClient

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

export async function getSql() {
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
