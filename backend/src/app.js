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
import { getDashboardRows, getDatabaseStatus, getRowById, hasDatabaseUrl, listRows, updateInfluencer } from './db.js'

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
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

function applyInfluencerToTierStats(tierStats, influencer) {
  const tier = influencer.tier === 'Mega/KOL' ? 'Mega' : influencer.tier
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
    brands: [...brandMap.values()].filter((brand) => brand.campaigns.length > 0),
    seniors,
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
    const resource = pathParts[1]
    const id = pathParts[2]

    if (req.method === 'PATCH' && resource === 'influencers' && id) {
      if (!hasDatabaseUrl()) {
        return sendJson(res, 409, {
          error: 'database_not_configured',
          message: 'Set DATABASE_URL to persist influencer updates.',
        })
      }

      const body = await readJsonBody(req)
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
