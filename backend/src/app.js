import {
  activities,
  brands,
  briefVersions,
  campaigns,
  currentStaffName,
  draftStatuses,
  influencers,
  notifications,
  roles,
  tasks,
  tierTargets,
} from '../../frontend/src/mock/agencyData.js'
import {
  createBrand,
  createCampaign,
  createInfluencer,
  createUser,
  deleteBrand,
  deleteCampaign,
  deleteUser,
  getDashboardRows,
  getDatabaseStatus,
  getRowById,
  getUserSession,
  hasDatabaseUrl,
  listPermissions,
  listRows,
  listUsers,
  updateBrand,
  updateCampaign,
  updateInfluencer,
  updateUser,
} from './db.js'

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-AgencyHub-User-Id,X-AgencyHub-Role',
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  Object.entries({ ...jsonHeaders, ...corsHeaders }).forEach(([key, value]) => res.setHeader(key, value))
  res.end(JSON.stringify(payload))
}

function findById(items, id) {
  return items.find((item) => String(item.id) === String(id))
}

const apiEndpoints = [
  'GET /api',
  'GET /api/health',
  'GET /api/db-status',
  'GET /api/dashboard',
  'GET /api/mock-data',
  'GET /api/roles',
  'GET /api/brands',
  'GET /api/brands/:id',
  'GET /api/campaigns',
  'GET /api/campaigns/:id',
  'GET /api/influencers',
  'GET /api/tasks',
  'GET /api/notifications',
  'GET /api/activities',
  'GET /api/tier-targets',
  'GET /api/brief-versions',
  'GET /api/draft-statuses',
  'GET /api/current-staff',
  'GET /api/session',
  'POST /api/session',
  'GET /api/users',
  'POST /api/users',
  'PATCH /api/users/:id',
  'DELETE /api/users/:id',
  'GET /api/permissions',
  'POST /api/brands',
  'PATCH /api/brands/:id',
  'DELETE /api/brands/:id',
  'POST /api/campaigns',
  'PATCH /api/campaigns/:id',
  'DELETE /api/campaigns/:id',
  'POST /api/influencers',
  'PATCH /api/influencers/:id',
]

const dbTables = {
  activities: 'activities',
  brands: 'brands',
  campaigns: 'campaigns',
  influencers: 'influencers',
  notifications: 'notifications',
  roles: 'roles',
  tasks: 'tasks',
  'tier-targets': 'tier_targets',
  'brief-versions': 'brief_versions',
  'draft-statuses': 'draft_statuses',
}

const seniors = [
  { id: 's1', name: 'พี่ตั้ม', role: 'Senior Manager' },
  { id: 's2', name: 'พี่นก', role: 'Senior Coordinator' },
]

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) return resolve({})

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function camelizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      value,
    ]),
  )
}

function normalizeRole(role = '') {
  const map = { Brand: 'brand', Owner: 'owner', Staff: 'staff' }
  return map[role] || String(role || '').toLowerCase() || 'brand'
}

function hasPermission(session, permissionKey) {
  return session?.permissions?.includes(permissionKey)
}

async function getRequestSession(req, body) {
  if (!hasDatabaseUrl()) {
    const role = normalizeRole(req.headers['x-agencyhub-role'] || body?.role || 'brand')
    return {
      id: role,
      name: role,
      role,
      permissions: role === 'owner'
        ? ['brand.read', 'brand.write', 'brand.delete', 'campaign.write', 'influencer.create', 'influencer.review', 'influencer.track', 'employee.manage', 'permission.manage']
        : role === 'staff'
          ? ['brand.read', 'influencer.create', 'influencer.track']
          : ['brand.read', 'influencer.brand_select'],
    }
  }

  const userId = req.headers['x-agencyhub-user-id'] || body?.userId || body?.username || req.headers['x-agencyhub-role'] || body?.role
  return getUserSession(userId, body?.password)
}

function sendForbidden(res, permissionKey) {
  return sendJson(res, 403, {
    error: 'forbidden',
    message: `Missing permission "${permissionKey}".`,
    permission: permissionKey,
  })
}

async function requirePermission(req, res, permissionKey, body) {
  const session = await getRequestSession(req, body)
  if (!hasPermission(session, permissionKey)) {
    sendForbidden(res, permissionKey)
    return null
  }
  return session
}

function inferChannelType(url = '') {
  if (url.includes('tiktok')) return 'tiktok'
  if (url.includes('youtube')) return 'youtube'
  if (url.includes('facebook')) return 'facebook'
  if (url.includes('lemon8')) return 'lemon8'
  if (url.includes('twitter') || url.includes('x.com')) return 'twitter'
  return 'instagram'
}

function normalizeStatus(status = '') {
  const map = {
    Confirmed: 'confirmed',
    Posted: 'confirmed',
    'Brand selected': 'brand_selected',
    'Owner approved': 'owner_approved',
    'Waiting owner review': 'pending_owner',
    'Owner rejected': 'owner_rejected',
    'Brand rejected': 'brand_rejected',
  }

  return map[status] || status || 'pending_owner'
}

function normalizeDraft(row) {
  if (row.draft) return row.draft

  const map = {
    'Waiting draft': 'waiting',
    'Draft submitted': 'review',
    'Revision requested': 'revise',
    'Draft approved': 'approved',
    Posted: 'posted',
  }

  return map[row.draftStatus] || 'waiting'
}

function emptyTierStats() {
  return Object.fromEntries(
    ['Nano', 'Micro', 'Mid', 'Macro', 'Mega'].map((tier) => [
      tier,
      { target: 0, sourced: 0, ownerApproved: 0, brandSelected: 0, confirmed: 0, posted: 0 },
    ]),
  )
}

function getTierGroup(tier = '') {
  if (tier.includes('Nano')) return 'Nano'
  if (tier.includes('Micro')) return 'Micro'
  if (tier.includes('Mid')) return 'Mid'
  if (tier.includes('Macro')) return 'Macro'
  if (tier.includes('100K')) return 'Macro'
  if (tier.includes('20K')) return 'Micro'
  if (tier.includes('5K')) return 'Nano'
  if (tier.includes('Mega')) return 'Mega'
  return tier === 'Mega/KOL' ? 'Mega' : tier
}

function applyInfluencerToTierStats(tierStats, influencer) {
  const tier = getTierGroup(influencer.tier)
  if (!tierStats[tier]) return

  tierStats[tier].sourced += 1
  if (['owner_approved', 'brand_selected', 'confirmed'].includes(influencer.status)) {
    tierStats[tier].ownerApproved += 1
  }
  if (['brand_selected', 'confirmed'].includes(influencer.status)) {
    tierStats[tier].brandSelected += 1
    tierStats[tier].confirmed += 1
  }
  if (influencer.draft === 'posted') {
    tierStats[tier].posted += 1
  }
}

function buildDashboardData(rows) {
  const brandMap = new Map()
  const campaignMap = new Map()

  rows.brands.forEach((row) => {
    const brand = camelizeRow(row)
    brand.initials = brand.initials || brand.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    brand.campaigns = []
    brandMap.set(brand.id, brand)
  })

  rows.campaigns.forEach((row) => {
    const campaign = camelizeRow(row)
    campaign.brandId = campaign.brandId || campaign.brand_id
    campaign.target = campaign.target || campaign.influencerTarget || campaign.brandQuota || 0
    campaign.brandQuota = campaign.brandQuota || campaign.target || 0
    campaign.startDate = campaign.startDate || campaign.dueDate || '-'
    campaign.deadlineDate = campaign.deadlineDate || campaign.dueDate || '-'
    campaign.tierStats = campaign.tierStats || emptyTierStats()
    campaign.influencers = []
    campaignMap.set(campaign.id, campaign)

    const brand = brandMap.get(campaign.brandId) || brandMap.values().next().value
    if (brand) brand.campaigns.push(campaign)
  })

  const firstCampaign = campaignMap.values().next().value

  rows.tierTargets.forEach((row) => {
    const target = camelizeRow(row)
    const campaign = target.campaignId ? campaignMap.get(target.campaignId) : firstCampaign
    const tier = target.tier === 'Mega/KOL' ? 'Mega' : target.tier
    if (campaign?.tierStats?.[tier]) {
      campaign.tierStats[tier] = {
        target: target.target || 0,
        sourced: target.sourced || 0,
        ownerApproved: target.ownerApproved || 0,
        brandSelected: target.brandSelected || 0,
        confirmed: target.confirmed || target.brandSelected || 0,
        posted: target.posted || 0,
      }
    }
  })

  rows.influencers.forEach((row) => {
    const influencer = camelizeRow(row)
    influencer.id = String(influencer.id)
    influencer.status = normalizeStatus(influencer.status)
    influencer.draft = normalizeDraft(influencer)
    influencer.channels = influencer.channels || (influencer.channel ? [{ type: inferChannelType(influencer.channel), url: influencer.channel }] : [])
    influencer.addedBy = influencer.addedBy || 'Staff A'
    influencer.addedByRole = influencer.addedByRole || 'staff'
    influencer.bank = influencer.bank || null
    influencer.seniorApproval = influencer.seniorApproval || null

    const campaign = influencer.campaignId ? campaignMap.get(influencer.campaignId) : firstCampaign
    if (campaign) {
      campaign.influencers.push(influencer)
      applyInfluencerToTierStats(campaign.tierStats, influencer)
    }
  })

  return {
    brands: [...brandMap.values()],
    seniors: (rows.users?.length ? rows.users : seniors).map((user) => ({
      id: user.id,
      name: user.name,
      roleId: user.roleId || user.role_id || user.role,
      role: user.title || user.role_id || user.role || 'Staff',
      email: user.email,
      active: user.active,
      permissions: user.permissions || [],
    })),
  }
}

export async function handleApiRequest(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))
      return res.end()
    }

    const baseUrl = `http://${req.headers.host || 'localhost'}`
    const url = new URL(req.url, baseUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const startsWithApi = pathParts[0] === 'api'
    const resource = startsWithApi ? pathParts[1] : pathParts[0]
    const id = startsWithApi ? pathParts[2] : pathParts[1]

    if (resource === 'session') {
      if (req.method === 'GET' || req.method === 'POST') {
        const body = req.method === 'POST' ? await readJsonBody(req) : {}
        const session = await getRequestSession(req, body)

        if (!session) {
          return sendJson(res, 401, {
            error: 'unauthorized',
            message: 'User was not found or is inactive.',
          })
        }

        return sendJson(res, 200, { user: session, permissions: session.permissions })
      }
    }

    if (resource === 'permissions') {
      if (req.method !== 'GET') {
        return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only GET is supported for permissions.' })
      }
      if (!hasDatabaseUrl()) return sendJson(res, 200, [])
      return sendJson(res, 200, await listPermissions())
    }

    if (resource === 'users') {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to manage employees.',
        })
      }

      if (req.method === 'GET') {
        const session = await requirePermission(req, res, 'employee.manage')
        if (!session) return
        return sendJson(res, 200, await listUsers())
      }

      const body = await readJsonBody(req)
      const requiredPermission = body.permissions ? 'permission.manage' : 'employee.manage'
      const session = await requirePermission(req, res, requiredPermission, body)
      if (!session) return

      if (req.method === 'POST') {
        const created = await createUser(body)
        return sendJson(res, 201, created)
      }

      if (req.method === 'PATCH' && id) {
        const updated = await updateUser(id, body)
        if (!updated) return sendJson(res, 404, { error: 'not_found', message: `No users item found for id "${id}".` })
        return sendJson(res, 200, updated)
      }

      if (req.method === 'DELETE' && id) {
        const deleted = await deleteUser(id)
        if (!deleted) return sendJson(res, 404, { error: 'not_found', message: `No users item found for id "${id}" or user cannot be deleted.` })
        return sendJson(res, 200, deleted)
      }
    }

    if (req.method === 'POST' && resource === 'brands') {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist brands.',
        })
      }

      const body = await readJsonBody(req)
      const session = await requirePermission(req, res, 'brand.write', body)
      if (!session) return
      const created = await createBrand(body)
      return sendJson(res, 201, camelizeRow(created))
    }

    if (req.method === 'PATCH' && resource === 'brands' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist brand updates.',
        })
      }

      const body = await readJsonBody(req)
      const session = await requirePermission(req, res, 'brand.write', body)
      if (!session) return
      const updated = await updateBrand(id, body)

      if (!updated) {
        return sendJson(res, 404, {
          error: 'not_found',
          message: `No brands item found for id "${id}".`,
        })
      }

      return sendJson(res, 200, camelizeRow(updated))
    }

    if (req.method === 'DELETE' && resource === 'brands' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to delete brands.',
        })
      }

      const session = await requirePermission(req, res, 'brand.delete')
      if (!session) return
      const deleted = await deleteBrand(id)

      if (!deleted) {
        return sendJson(res, 404, {
          error: 'not_found',
          message: `No brands item found for id "${id}".`,
        })
      }

      return sendJson(res, 200, camelizeRow(deleted))
    }

    if (req.method === 'POST' && resource === 'campaigns') {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist campaigns.',
        })
      }

      const body = await readJsonBody(req)
      const session = await requirePermission(req, res, 'campaign.write', body)
      if (!session) return
      const created = await createCampaign(body)
      return sendJson(res, 201, camelizeRow(created))
    }

    if (req.method === 'PATCH' && resource === 'campaigns' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist campaign updates.',
        })
      }

      const body = await readJsonBody(req)
      const session = await requirePermission(req, res, 'campaign.write', body)
      if (!session) return
      const updated = await updateCampaign(id, body)

      if (!updated) {
        return sendJson(res, 404, {
          error: 'not_found',
          message: `No campaigns item found for id "${id}".`,
        })
      }

      return sendJson(res, 200, camelizeRow(updated))
    }

    if (req.method === 'DELETE' && resource === 'campaigns' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to delete campaigns.',
        })
      }

      const session = await requirePermission(req, res, 'campaign.write')
      if (!session) return
      const deleted = await deleteCampaign(id)

      if (!deleted) {
        return sendJson(res, 404, {
          error: 'not_found',
          message: `No campaigns item found for id "${id}".`,
        })
      }

      return sendJson(res, 200, camelizeRow(deleted))
    }

    if (req.method === 'POST' && resource === 'influencers') {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist influencers.',
        })
      }

      const body = await readJsonBody(req)
      const session = await requirePermission(req, res, 'influencer.create', body)
      if (!session) return
      body.addedBy = body.addedBy || session.name
      body.addedByRole = body.addedByRole || session.role
      const created = await createInfluencer(body)
      return sendJson(res, 201, camelizeRow(created))
    }

    if (req.method === 'PATCH' && resource === 'influencers' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist influencer updates.',
        })
      }

      const body = await readJsonBody(req)
      const statusPermissionMap = {
        pending_owner: 'influencer.create',
        owner_approved: 'influencer.review',
        owner_rejected: 'influencer.review',
        confirmed: 'influencer.review',
        brand_selected: 'influencer.brand_select',
      }
      const isTrackingUpdate = Object.hasOwn(body, 'draft') || Object.hasOwn(body, 'postDate') || Object.hasOwn(body, 'postLink') || Object.hasOwn(body, 'assetLink')
      const isProfileUpdate = Object.hasOwn(body, 'name') || Object.hasOwn(body, 'channel') || Object.hasOwn(body, 'channels') || Object.hasOwn(body, 'tier') || Object.hasOwn(body, 'followers') || Object.hasOwn(body, 'dealDate') || Object.hasOwn(body, 'bank') || Object.hasOwn(body, 'extraInfo')
      const permissionKey = statusPermissionMap[body.status] || (isProfileUpdate ? 'influencer.create' : isTrackingUpdate ? 'influencer.track' : 'influencer.review')
      const session = await requirePermission(req, res, permissionKey, body)
      if (!session) return
      const updated = await updateInfluencer(id, body)

      if (!updated) {
        return sendJson(res, 404, {
          error: 'not_found',
          message: `No influencers item found for id "${id}".`,
        })
      }

      return sendJson(res, 200, camelizeRow(updated))
    }

    if (req.method !== 'GET') {
      return sendJson(res, 405, {
        error: 'method_not_allowed',
        message: 'Only GET and supported PATCH requests are supported by the current API.',
      })
    }

    if (url.pathname === '/api' || url.pathname === '/api/') {
      return sendJson(res, 200, {
        name: 'AgencyHub API',
        status: 'ok',
        endpoints: apiEndpoints,
      })
    }

    if (resource === 'health') {
      return sendJson(res, 200, { status: 'ok' })
    }

    if (resource === 'db-status') {
      return sendJson(res, 200, await getDatabaseStatus())
    }

    if (resource === 'dashboard') {
      if (hasDatabaseUrl()) {
        const dashboardRows = await getDashboardRows()
        return sendJson(res, 200, buildDashboardData(dashboardRows))
      }

      return sendJson(res, 200, buildDashboardData({
        brands,
        campaigns,
        influencers,
        tierTargets,
      }))
    }

    const collections = {
      activities,
      brands,
      'brief-versions': briefVersions,
      campaigns,
      'current-staff': { name: currentStaffName },
      'draft-statuses': draftStatuses,
      influencers,
      notifications,
      roles,
      tasks,
      'tier-targets': tierTargets,
    }

    if (resource === 'mock-data') {
      return sendJson(res, 200, {
        activities,
        brands,
        briefVersions,
        campaigns,
        currentStaffName,
        draftStatuses,
        influencers,
        notifications,
        roles,
        tasks,
        tierTargets,
      })
    }

    if (Object.hasOwn(collections, resource)) {
      if (hasDatabaseUrl() && Object.hasOwn(dbTables, resource)) {
        const tableName = dbTables[resource]

        if (id) {
          const row = await getRowById(tableName, id)

          if (!row) {
            return sendJson(res, 404, {
              error: 'not_found',
              message: `No ${resource} item found for id "${id}".`,
            })
          }

          return sendJson(res, 200, row)
        }

        return sendJson(res, 200, await listRows(tableName))
      }

      const collection = collections[resource]

      if (id) {
        if (!Array.isArray(collection)) {
          return sendJson(res, 400, {
            error: 'invalid_resource_lookup',
            message: `Resource "${resource}" does not support lookup by id.`,
          })
        }

        const item = findById(collection, id)

        if (!item) {
          return sendJson(res, 404, {
            error: 'not_found',
            message: `No ${resource} item found for id "${id}".`,
          })
        }

        return sendJson(res, 200, item)
      }

      return sendJson(res, 200, collection)
    }

    return sendJson(res, 404, {
      error: 'not_found',
      message: 'API endpoint not found',
    })
  } catch (error) {
    return sendJson(res, 500, {
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unexpected API error',
    })
  }
}
