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

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function createUniqueId(sql, tableName, seed, prefix) {
  const baseId = slugify(seed) || `${prefix}-${Date.now()}`
  let id = baseId
  let suffix = 1

  while ((await sql`select id from ${sql(tableName)} where id = ${id} limit 1`).length) {
    suffix += 1
    id = `${baseId}-${suffix}`
  }

  return id
}

export async function createBrand(values) {
  const sql = await getSql()
  if (!sql) return null

  const name = String(values.name || '').trim()
  if (!name) {
    throw new Error('Brand name is required.')
  }

  const id = await createUniqueId(sql, 'brands', values.id || name, 'brand')

  const rows = await sql`
    insert into brands (
      id,
      name,
      category,
      contact,
      active_campaigns,
      health,
      initials
    ) values (
      ${id},
      ${name},
      ${values.category || null},
      ${values.contact || null},
      ${0},
      ${values.health || 'ใหม่'},
      ${values.initials || name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
    )
    returning *
  `

  return rows[0]
}

export async function deleteBrand(id) {
  const sql = await getSql()
  if (!sql) return null

  return sql.begin(async (tx) => {
    const campaigns = await tx`select id from campaigns where brand_id = ${id}`
    const campaignIds = campaigns.map((campaign) => campaign.id)

    if (campaignIds.length) {
      await tx`delete from influencers where campaign_id in ${tx(campaignIds)}`
      await tx`delete from campaigns where id in ${tx(campaignIds)}`
    }

    const rows = await tx`delete from brands where id = ${id} returning *`
    return rows[0] || null
  })
}

export async function createCampaign(values) {
  const sql = await getSql()
  if (!sql) return null

  const name = String(values.name || '').trim()
  const brandId = String(values.brandId || values.brand_id || '').trim()
  if (!name) throw new Error('Campaign name is required.')
  if (!brandId) throw new Error('Brand id is required.')

  const brandRows = await sql`select * from brands where id = ${brandId} limit 1`
  const brand = brandRows[0]
  if (!brand) throw new Error(`Brand "${brandId}" was not found.`)

  const id = await createUniqueId(sql, 'campaigns', values.id || `${brandId}-${name}`, 'campaign')
  const target = Number(values.target || values.influencerTarget || values.brandQuota || 0)
  const brandQuota = Number(values.brandQuota || target || 0)
  const tiers = ['Nano', 'Micro', 'Mid', 'Macro', 'Mega']

  return sql.begin(async (tx) => {
    const rows = await tx`
      insert into campaigns (
        id,
        brand_id,
        brand_name,
        name,
        objective,
        status,
        progress,
        confirmed_influencers,
        influencer_target,
        posted_content,
        pending_review,
        waiting_brand_selection,
        brand_quota,
        team_submitted,
        owner_approved,
        brand_selected,
        due_date,
        budget,
        start_date,
        deadline_date,
        target,
        brief_file,
        brief_version,
        brief_date
      ) values (
        ${id},
        ${brandId},
        ${brand.name},
        ${name},
        ${values.objective || null},
        ${values.status || 'Active'},
        ${0},
        ${0},
        ${target},
        ${0},
        ${0},
        ${0},
        ${brandQuota},
        ${0},
        ${0},
        ${0},
        ${values.deadlineDate || values.dueDate || null},
        ${values.budget || null},
        ${values.startDate || null},
        ${values.deadlineDate || null},
        ${target},
        ${values.briefFile || null},
        ${values.briefVersion || (values.briefFile ? 'v1' : null)},
        ${values.briefDate || null}
      )
      returning *
    `

    await tx`
      update brands
      set active_campaigns = (
        select count(*)::int from campaigns where brand_id = ${brandId}
      ), updated_at = now()
      where id = ${brandId}
    `

    for (const tier of tiers) {
      const tierTarget = Number(values.tierTargets?.[tier] || 0)
      await tx`
        insert into tier_targets (
          id,
          campaign_id,
          tier,
          target,
          owner_approved,
          brand_selected,
          sourced,
          confirmed,
          posted
        ) values (
          ${`${id}-${slugify(tier)}`},
          ${id},
          ${tier},
          ${tierTarget},
          ${0},
          ${0},
          ${0},
          ${0},
          ${0}
        )
      `
    }

    return rows[0]
  })
}

export async function createInfluencer(values) {
  const sql = await getSql()
  if (!sql) return null

  const name = String(values.name || '').trim()
  const campaignId = String(values.campaignId || values.campaign_id || '').trim()
  if (!name) throw new Error('Influencer name is required.')
  if (!campaignId) throw new Error('Campaign id is required.')

  const campaignRows = await sql`select id from campaigns where id = ${campaignId} limit 1`
  if (!campaignRows[0]) throw new Error(`Campaign "${campaignId}" was not found.`)

  const id = await createUniqueId(sql, 'influencers', values.id || `${campaignId}-${name}`, 'influencer')
  const channel = values.channel || values.instagram || values.tiktok || values.youtube || values.facebook || values.twitter || values.lemon8 || null
  const channels = values.channels || ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'lemon8']
    .map((type) => ({ type, url: values[type] }))
    .filter((item) => item.url)
  const bank = values.bankName || values.bankAccount || values.bankOwner
    ? { name: values.bankName || '', account: values.bankAccount || '', owner: values.bankOwner || '' }
    : null

  const rows = await sql`
    insert into influencers (
      id,
      campaign_id,
      name,
      channel,
      channels,
      tier,
      followers,
      added_by,
      added_by_role,
      deal_date,
      status,
      draft_status,
      draft,
      product_sent,
      bank
    ) values (
      ${id},
      ${campaignId},
      ${name},
      ${channel},
      ${channels.length ? sql.json(channels) : null},
      ${values.tier || 'Nano'},
      ${values.followers || null},
      ${values.addedBy || null},
      ${values.addedByRole || null},
      ${values.dealDate || null},
      ${values.status || 'pending_owner'},
      ${values.draftStatus || 'Waiting draft'},
      ${values.draft || 'waiting'},
      ${Boolean(values.productSent)},
      ${bank ? sql.json(bank) : null}
    )
    returning *
  `

  return rows[0]
}
