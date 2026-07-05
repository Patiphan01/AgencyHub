const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getSessionHeaders() {
  const userId = localStorage.getItem('agencyhub-user-id')
  const role = localStorage.getItem('agencyhub-role')
  return {
    ...(userId ? { 'X-AgencyHub-User-Id': userId } : {}),
    ...(role ? { 'X-AgencyHub-Role': role } : {}),
  }
}

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getSessionHeaders(),
  })
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`API did not return JSON for ${path}. Check Vercel API routing.`)
  }

  return response.json()
}

async function sendJson(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getSessionHeaders(),
      ...(options?.headers || {}),
    },
  })
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`API did not return JSON for ${path}. Check Vercel API routing.`)
  }

  return response.json()
}

export function getHealthStatus() {
  return getJson('/api/health')
}

export function getMockData() {
  return getJson('/api/mock-data')
}

export function getSession() {
  return getJson('/api/session')
}

export function loginSession(values) {
  return sendJson('/api/session', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function getDashboardData() {
  return getJson('/api/dashboard')
}

export function getRoles() {
  return getJson('/api/roles')
}

export function getBrands() {
  return getJson('/api/brands')
}

export function getBrand(id) {
  return getJson(`/api/brands/${id}`)
}

export function createBrand(values) {
  return sendJson('/api/brands', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateBrand(id, values) {
  return sendJson(`/api/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteBrand(id) {
  return sendJson(`/api/brands/${id}`, {
    method: 'DELETE',
  })
}

export function getCampaigns() {
  return getJson('/api/campaigns')
}

export function getCampaign(id) {
  return getJson(`/api/campaigns/${id}`)
}

export function createCampaign(values) {
  return sendJson('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateCampaign(id, values) {
  return sendJson(`/api/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteCampaign(id) {
  return sendJson(`/api/campaigns/${id}`, {
    method: 'DELETE',
  })
}

export function getInfluencers() {
  return getJson('/api/influencers')
}

export function createInfluencer(values) {
  return sendJson('/api/influencers', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function getTasks() {
  return getJson('/api/tasks')
}

export function updateInfluencer(id, values) {
  return sendJson(`/api/influencers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function getPermissions() {
  return getJson('/api/permissions')
}

export function getUsers() {
  return getJson('/api/users')
}

export function createUser(values) {
  return sendJson('/api/users', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateUser(id, values) {
  return sendJson(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteUser(id) {
  return sendJson(`/api/users/${id}`, {
    method: 'DELETE',
  })
}
