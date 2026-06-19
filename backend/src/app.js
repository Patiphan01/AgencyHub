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
]

export async function handleApiRequest(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))
      return res.end()
    }

    if (req.method !== 'GET') {
      return sendJson(res, 405, {
        error: 'method_not_allowed',
        message: 'Only GET requests are supported by the current API.',
      })
    }

    const baseUrl = `http://${req.headers.host || 'localhost'}`
    const url = new URL(req.url, baseUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const resource = pathParts[1]
    const id = pathParts[2]

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
