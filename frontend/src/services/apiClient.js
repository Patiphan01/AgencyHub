const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

async function sendJson(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

export function getHealthStatus() {
  return getJson('/api/health')
}

export function getMockData() {
  return getJson('/api/mock-data')
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

export function getCampaigns() {
  return getJson('/api/campaigns')
}

export function getCampaign(id) {
  return getJson(`/api/campaigns/${id}`)
}

export function getInfluencers() {
  return getJson('/api/influencers')
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
