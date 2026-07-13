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

async function queryDashboardRows(sql) {
  const [brandRows, campaignRows, influencerRows, tierRows, userRows] = await Promise.all([
    sql`select * from brands order by id`,
    sql`select * from campaigns order by id`,
    sql`select * from influencers order by id`,
    sql`select * from tier_targets order by id`,
    sql`
      select u.*, coalesce(
        (
          select jsonb_agg(distinct permission_key)
          from (
            select rp.permission_key
            from role_permissions rp
            where rp.role_id = u.role_id
              and not exists (select 1 from user_permissions custom where custom.user_id = u.id)
            union
            select up.permission_key
            from user_permissions up
            where up.user_id = u.id and up.granted = true
          ) permissions
        ),
        '[]'::jsonb
      ) as permissions
      from app_users u
      where u.active = true
      order by u.role_id, u.name
    `,
  ])

  return {
    brands: brandRows,
    campaigns: campaignRows,
    influencers: influencerRows,
    tierTargets: tierRows,
    users: userRows,
  }
}

export async function getDashboardRows() {
  const sql = await getSql()
  if (!sql) return null

  try {
    const rows = await queryDashboardRows(sql)
    dataSchemaReady = true
    authSchemaReady = true
    return rows
  } catch (error) {
    if (!isSchemaMissingError(error)) throw error
    await Promise.all([ensureDataSchema(), ensureAuthSchema()])
    return queryDashboardRows(sql)
  }
}

export const permissionDefinitions = [
  ['brand.read', 'View brands', 'View brand and campaign data'],
  ['brand.write', 'Create and edit brands', 'Create or update brand records'],
  ['brand.delete', 'Delete brands', 'Delete brands and related campaign data'],
  ['campaign.write', 'Manage campaigns', 'Create and update campaign setup'],
  ['influencer.create', 'Add influencers', 'Add influencer candidates'],
  ['influencer.review', 'Review influencers', 'Approve, reject, or confirm influencer candidates'],
  ['influencer.brand_select', 'Brand selection', 'Select influencers as a brand user'],
  ['influencer.track', 'Track production', 'Update draft, post, asset, and payment tracking fields'],
  ['employee.manage', 'Manage employees', 'Create, edit, disable, and delete employees'],
  ['permission.manage', 'Manage permissions', 'Assign permissions to employees'],
]

const defaultRolePermissions = {
  owner: permissionDefinitions.map(([key]) => key).filter((key) => key !== 'influencer.brand_select'),
  brand: ['brand.read', 'influencer.brand_select'],
  staff: ['brand.read', 'influencer.create', 'influencer.track'],
}

let authSchemaReady = false
let dataSchemaReady = false
let authSchemaPromise = null
let dataSchemaPromise = null

function isSchemaMissingError(error) {
  return error?.code === '42P01' || error?.code === '42703'
}

export async function ensureDataSchema() {
  const sql = await getSql()
  if (!sql || dataSchemaReady) return
  if (dataSchemaPromise) return dataSchemaPromise

  dataSchemaPromise = sql.begin(async (tx) => {
    const requiredColumns = {
      campaigns: {
        start_date: 'text',
        deadline_date: 'text',
        target: 'integer',
        brief_file: 'text',
        brief_version: 'text',
        brief_date: 'text',
        tier_stats: 'jsonb',
        campaign_settings: 'jsonb',
      },
      influencers: {
        channels: 'jsonb',
        added_by_role: 'text',
        draft: 'text',
        asset_link: 'text',
        bank: 'jsonb',
        senior_approval: 'jsonb',
        extra_info: 'jsonb',
      },
      tier_targets: {
        campaign_id: 'text references campaigns(id) on delete cascade',
        sourced: 'integer',
        confirmed: 'integer',
        posted: 'integer',
      },
      brief_versions: {
        campaign_id: 'text references campaigns(id) on delete cascade',
        brief_file: 'text',
        brief_date: 'text',
      },
    }

    for (const [tableName, columns] of Object.entries(requiredColumns)) {
      const existingRows = await tx`
        select column_name
        from information_schema.columns
        where table_schema = 'public' and table_name = ${tableName}
      `
      const existingColumns = new Set(existingRows.map((row) => row.column_name))

      for (const [columnName, definition] of Object.entries(columns)) {
        if (existingColumns.has(columnName)) continue
        await tx.unsafe(`alter table ${tableName} add column ${columnName} ${definition}`)
      }
    }
  }).then(() => {
    dataSchemaReady = true
  }).finally(() => {
    dataSchemaPromise = null
  })

  return dataSchemaPromise
}

export async function ensureAuthSchema() {
  const sql = await getSql()
  if (!sql || authSchemaReady) return
  if (authSchemaPromise) return authSchemaPromise

  authSchemaPromise = sql.begin(async (tx) => {
    await tx`
      create table if not exists permissions (
        key text primary key,
        label text not null,
        description text,
        created_at timestamptz not null default now()
      )
    `
    await tx`
      create table if not exists role_permissions (
        role_id text references roles(id) on delete cascade,
        permission_key text references permissions(key) on delete cascade,
        primary key (role_id, permission_key)
      )
    `
    await tx`
      create table if not exists app_users (
        id text primary key,
        name text not null,
        email text unique,
        username text unique,
        password text,
        role_id text references roles(id),
        title text,
        active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `
    await tx`
      alter table app_users
        add column if not exists username text,
        add column if not exists password text
    `
    await tx`create unique index if not exists app_users_username_key on app_users(username) where username is not null`
    await tx`
      create table if not exists user_permissions (
        user_id text references app_users(id) on delete cascade,
        permission_key text references permissions(key) on delete cascade,
        granted boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (user_id, permission_key)
      )
    `

    await tx`insert into roles (id, name) values ('brand', 'Brand'), ('owner', 'Owner'), ('staff', 'Staff') on conflict (id) do update set name = excluded.name`

    for (const [key, label, description] of permissionDefinitions) {
      await tx`
        insert into permissions (key, label, description)
        values (${key}, ${label}, ${description})
        on conflict (key) do update set label = excluded.label, description = excluded.description
      `
    }

    for (const [roleId, permissionKeys] of Object.entries(defaultRolePermissions)) {
      for (const permissionKey of permissionKeys) {
        await tx`
          insert into role_permissions (role_id, permission_key)
          values (${roleId}, ${permissionKey})
          on conflict do nothing
        `
      }
    }

    const defaults = [
      ['owner', 'หัวหน้า', 'owner@agencyhub.local', 'owner', 'Owner'],
      ['brand', 'Brand', 'brand@agencyhub.local', 'brand', 'Brand user'],
      ['staff', 'Staff', 'staff@agencyhub.local', 'staff', 'Staff'],
    ]

    for (const [id, name, email, roleId, title] of defaults) {
      await tx`
        insert into app_users (id, name, email, username, password, role_id, title, active)
        values (${id}, ${name}, ${email}, ${id}, ${id}, ${roleId}, ${title}, true)
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          username = coalesce(app_users.username, excluded.username),
          password = coalesce(app_users.password, excluded.password),
          role_id = excluded.role_id,
          title = excluded.title,
          active = excluded.active,
          updated_at = now()
      `
    }
  }).then(() => {
    authSchemaReady = true
  }).finally(() => {
    authSchemaPromise = null
  })

  return authSchemaPromise
}

function normalizeUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: row.role_id,
    roleId: row.role_id,
    title: row.title,
    active: row.active,
    permissions: row.permissions || [],
  }
}

function queryUserSession(sql, value) {
  return sql`
    select u.*, coalesce(
      (
        select jsonb_agg(distinct permission_key)
        from (
          select rp.permission_key
          from role_permissions rp
          where rp.role_id = u.role_id
            and not exists (select 1 from user_permissions custom where custom.user_id = u.id)
          union
          select up.permission_key
          from user_permissions up
          where up.user_id = u.id and up.granted = true
        ) permissions
      ),
      '[]'::jsonb
    ) as permissions
    from app_users u
    where u.active = true and (
      lower(u.id) = ${value}
      or lower(u.role_id) = ${value}
      or lower(coalesce(u.email, '')) = ${value}
      or lower(coalesce(u.username, '')) = ${value}
    )
    order by case when lower(u.id) = ${value} then 0 else 1 end
    limit 1
  `
}

export async function getUserSession(userIdOrRole = 'brand', password) {
  const sql = await getSql()
  if (!sql) return null

  const value = String(userIdOrRole || 'brand').toLowerCase()
  let rows

  try {
    rows = await queryUserSession(sql, value)
    authSchemaReady = true
  } catch (error) {
    if (!isSchemaMissingError(error)) throw error
    await ensureAuthSchema()
    rows = await queryUserSession(sql, value)
  }

  if (!rows.length && !authSchemaReady) {
    await ensureAuthSchema()
    rows = await queryUserSession(sql, value)
  }

  const row = rows[0]
  if (!row) return null

  // Mockup login only: plain-text passwords are for prototype testing.
  // Production auth should replace this with hashed passwords or an auth provider.
  if (password && row.password && row.password !== password) return null

  return normalizeUser(row)
}

export async function listPermissions() {
  const sql = await getSql()
  if (!sql) return []
  await ensureAuthSchema()
  return sql`select * from permissions order by key`
}

export async function listUsers() {
  const sql = await getSql()
  if (!sql) return []
  await ensureAuthSchema()
  const rows = await sql`
    select u.*, coalesce(
      (
        select jsonb_agg(distinct permission_key)
        from (
          select rp.permission_key
          from role_permissions rp
          where rp.role_id = u.role_id
            and not exists (select 1 from user_permissions custom where custom.user_id = u.id)
          union
          select up.permission_key
          from user_permissions up
          where up.user_id = u.id and up.granted = true
        ) permissions
      ),
      '[]'::jsonb
    ) as permissions
    from app_users u
    order by u.role_id, u.name
  `
  return rows.map(normalizeUser)
}

export async function createUser(values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureAuthSchema()

  const name = String(values.name || '').trim()
  if (!name) throw new Error('Employee name is required.')

  const roleId = String(values.roleId || values.role || 'staff').toLowerCase()
  const username = String(values.username || values.email || '').trim()
  const password = String(values.password || '').trim()
  const id = await createUniqueId(sql, 'app_users', values.id || username || values.email || name, 'user')
  const permissionKeys = Array.isArray(values.permissions) ? values.permissions : defaultRolePermissions[roleId] || []

  return sql.begin(async (tx) => {
    const rows = await tx`
      insert into app_users (id, name, email, username, password, role_id, title, active)
      values (${id}, ${name}, ${values.email || null}, ${username || null}, ${password || null}, ${roleId}, ${values.title || null}, ${values.active !== false})
      returning *
    `

    for (const permissionKey of permissionKeys) {
      await tx`
        insert into user_permissions (user_id, permission_key, granted)
        values (${id}, ${permissionKey}, true)
        on conflict (user_id, permission_key) do update set granted = true, updated_at = now()
      `
    }

    return rows[0]
  })
}

export async function updateUser(id, values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureAuthSchema()

  const allowedFields = {
    name: 'name',
    email: 'email',
    username: 'username',
    password: 'password',
    role: 'role_id',
    roleId: 'role_id',
    title: 'title',
    active: 'active',
  }
  const updates = Object.entries(values)
    .filter(([key]) => Object.hasOwn(allowedFields, key))
    .map(([key, value]) => ({ column: allowedFields[key], value }))

  return sql.begin(async (tx) => {
    let row = null
    if (updates.length) {
      const updateObject = Object.fromEntries(updates.map(({ column, value }) => [column, value]))
      const rows = await tx`
        update app_users
        set ${tx(updateObject)}, updated_at = now()
        where id = ${id}
        returning *
      `
      row = rows[0] || null
    } else {
      const rows = await tx`select * from app_users where id = ${id} limit 1`
      row = rows[0] || null
    }

    if (Array.isArray(values.permissions)) {
      await tx`delete from user_permissions where user_id = ${id}`
      for (const permissionKey of values.permissions) {
        await tx`
          insert into user_permissions (user_id, permission_key, granted)
          values (${id}, ${permissionKey}, true)
          on conflict (user_id, permission_key) do update set granted = true, updated_at = now()
        `
      }
    }

    return row
  })
}

export async function deleteUser(id) {
  const sql = await getSql()
  if (!sql) return null
  await ensureAuthSchema()
  const rows = await sql`delete from app_users where id = ${id} and role_id <> 'owner' returning *`
  return rows[0] || null
}

export async function updateInfluencer(id, values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

  const allowedFields = {
    name: 'name',
    channel: 'channel',
    channels: 'channels',
    tier: 'tier',
    followers: 'followers',
    dealDate: 'deal_date',
    status: 'status',
    draft: 'draft',
    draftStatus: 'draft_status',
    productSent: 'product_sent',
    postDate: 'post_date',
    postLink: 'post_link',
    assetLink: 'asset_link',
    bank: 'bank',
    seniorApproval: 'senior_approval',
    extraInfo: 'extra_info',
  }

  const updates = Object.entries(values)
    .filter(([key]) => Object.hasOwn(allowedFields, key))
    .map(([key, value]) => ({ column: allowedFields[key], value }))

  if (!updates.length) {
    const rows = await sql`select * from influencers where id = ${id} limit 1`
    return rows[0] || null
  }

  return sql.begin(async (tx) => {
    let row = null
    const scalarUpdates = updates.filter(({ column }) => !['channels', 'bank', 'senior_approval', 'extra_info'].includes(column))

    if (scalarUpdates.length) {
      const updateObject = Object.fromEntries(scalarUpdates.map(({ column, value }) => [column, value]))
      const rows = await tx`
        update influencers
        set ${tx(updateObject)}, updated_at = now()
        where id = ${id}
        returning *
      `
      row = rows[0] || null
    }

    for (const { column, value } of updates.filter(({ column }) => ['channels', 'bank', 'senior_approval', 'extra_info'].includes(column))) {
      const jsonValue = value == null ? null : tx.json(value)
      if (column === 'channels') {
        const rows = await tx`update influencers set channels = ${jsonValue}, updated_at = now() where id = ${id} returning *`
        row = rows[0] || row
      }
      if (column === 'bank') {
        const rows = await tx`update influencers set bank = ${jsonValue}, updated_at = now() where id = ${id} returning *`
        row = rows[0] || row
      }
      if (column === 'senior_approval') {
        const rows = await tx`update influencers set senior_approval = ${jsonValue}, updated_at = now() where id = ${id} returning *`
        row = rows[0] || row
      }
      if (column === 'extra_info') {
        const rows = await tx`update influencers set extra_info = ${jsonValue}, updated_at = now() where id = ${id} returning *`
        row = rows[0] || row
      }
    }

    return row
  })
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

export async function updateBrand(id, values) {
  const sql = await getSql()
  if (!sql) return null

  const allowedFields = {
    name: 'name',
    category: 'category',
    contact: 'contact',
    health: 'health',
    initials: 'initials',
    activeCampaigns: 'active_campaigns',
  }
  const updates = Object.entries(values)
    .filter(([key]) => Object.hasOwn(allowedFields, key))
    .map(([key, value]) => ({ column: allowedFields[key], value }))

  if (!updates.length) {
    const rows = await sql`select * from brands where id = ${id} limit 1`
    return rows[0] || null
  }

  const updateObject = Object.fromEntries(updates.map(({ column, value }) => [column, value]))
  const rows = await sql`
    update brands
    set ${sql(updateObject)}, updated_at = now()
    where id = ${id}
    returning *
  `

  return rows[0] || null
}

export async function deleteBrand(id) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

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

export async function deleteCampaign(id) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

  return sql.begin(async (tx) => {
    const campaignRows = await tx`select * from campaigns where id = ${id} limit 1`
    const campaign = campaignRows[0]
    if (!campaign) return null

    await tx`delete from influencers where campaign_id = ${id}`
    await tx`delete from tier_targets where campaign_id = ${id}`
    await tx`delete from brief_versions where campaign_id = ${id}`

    const rows = await tx`delete from campaigns where id = ${id} returning *`

    if (campaign.brand_id) {
      await tx`
        update brands
        set active_campaigns = (
          select count(*)::int from campaigns where brand_id = ${campaign.brand_id}
        ), updated_at = now()
        where id = ${campaign.brand_id}
      `
    }

    return rows[0] || null
  })
}

export async function createCampaign(values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

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
        brief_date,
        campaign_settings
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
        ${values.briefDate || null},
        ${values.campaignSettings ? tx.json(values.campaignSettings) : null}
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

export async function updateCampaign(id, values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

  const allowedFields = {
    name: 'name',
    objective: 'objective',
    status: 'status',
    target: 'target',
    influencerTarget: 'influencer_target',
    brandQuota: 'brand_quota',
    startDate: 'start_date',
    deadlineDate: 'deadline_date',
    dueDate: 'due_date',
    budget: 'budget',
    briefFile: 'brief_file',
    briefVersion: 'brief_version',
    briefDate: 'brief_date',
    campaignSettings: 'campaign_settings',
  }

  const updates = Object.entries(values)
    .filter(([key]) => Object.hasOwn(allowedFields, key))
    .map(([key, value]) => ({ column: allowedFields[key], value }))

  if (!updates.length) {
    const rows = await sql`select * from campaigns where id = ${id} limit 1`
    return rows[0] || null
  }

  return sql.begin(async (tx) => {
    const scalarUpdates = updates.filter(({ column }) => column !== 'campaign_settings')
    let row = null

    if (scalarUpdates.length) {
      const updateObject = Object.fromEntries(scalarUpdates.map(({ column, value }) => [column, value]))
      const rows = await tx`
        update campaigns
        set ${tx(updateObject)}, updated_at = now()
        where id = ${id}
        returning *
      `
      row = rows[0] || null
    }

    const settingsUpdate = updates.find(({ column }) => column === 'campaign_settings')
    if (settingsUpdate) {
      const jsonValue = settingsUpdate.value == null ? null : tx.json(settingsUpdate.value)
      const rows = await tx`update campaigns set campaign_settings = ${jsonValue}, updated_at = now() where id = ${id} returning *`
      row = rows[0] || row
    }

    return row
  })
}

export async function createInfluencer(values) {
  const sql = await getSql()
  if (!sql) return null
  await ensureDataSchema()

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
      bank,
      extra_info
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
      ${bank ? sql.json(bank) : null},
      ${values.extraInfo ? sql.json(values.extraInfo) : null}
    )
    returning *
  `

  return rows[0]
}
