/**
 * AgencyHub Database Schema Reference
 *
 * Scope:
 * - This file documents structures found in the existing source code only.
 * - No real database client, migrations, ORM models, SQL queries, or active backend
 *   persistence layer were found during the project scan.
 * - The "tables" below are logical schema references derived from current frontend
 *   mock data and UI data structures. Physical database table names and constraints
 *   are TODO until real database code exists.
 *
 * Sources scanned:
 * - frontend/src/mock/agencyData.js
 * - frontend/src/pages/MockupDashboard.jsx
 * - frontend/src/pages/**/*.jsx
 * - frontend/src/components/**/*.jsx
 * - frontend/src/routes/AppRoutes.jsx
 *
 * Search result summary:
 * - API/database clients found: TODO - none found in source code before backend setup.
 * - Database queries found: TODO - none found.
 * - Existing fetch/axios requests found: TODO - none found before backend health check.
 */

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'string | null'
  | 'object | null'
  | 'TODO'

export type SchemaField = {
  name: string
  type: FieldType
  notes?: string
}

export type SchemaTable = {
  tableName: string
  source: string
  purpose: string
  fields: SchemaField[]
  relationships: string[]
  todos?: string[]
}

export const schemaReference: SchemaTable[] = [
  {
    tableName: 'roles',
    source: 'frontend/src/mock/agencyData.js: roles',
    purpose: 'Stores selectable demo user roles used by mock login and role-based dashboard navigation.',
    fields: [
      { name: 'value', type: 'string', notes: 'Observed values: Brand, Owner, Staff.' },
    ],
    relationships: ['Used by mock login only. No persisted user table was found.'],
    todos: ['Confirm whether roles should become a lookup table or enum in the real database.'],
  },
  {
    tableName: 'brands',
    source: 'frontend/src/mock/agencyData.js: brands; frontend/src/pages/MockupDashboard.jsx: DB.brands',
    purpose: 'Stores brand/client accounts managed by the agency.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'contact', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'activeCampaigns', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'health', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'initials', type: 'string', notes: 'Found in MockupDashboard DB only.' },
    ],
    relationships: ['One brand has many campaigns via campaigns.brandId or nested DB.brands[].campaigns.'],
    todos: ['Confirm whether contact, health, and activeCampaigns are stored fields or derived UI values.'],
  },
  {
    tableName: 'campaigns',
    source: 'frontend/src/mock/agencyData.js: campaigns; frontend/src/pages/MockupDashboard.jsx: DB.brands[].campaigns',
    purpose: 'Stores influencer marketing campaigns for each brand.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'brandId', type: 'string', notes: 'Found in agencyData.js; inferred by nesting in MockupDashboard DB.' },
      { name: 'brandName', type: 'string', notes: 'Found in agencyData.js and derived in MockupDashboard.' },
      { name: 'name', type: 'string' },
      { name: 'objective', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'status', type: 'string' },
      { name: 'progress', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'confirmedInfluencers', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'influencerTarget', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'postedContent', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'pendingReview', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'waitingBrandSelection', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'brandQuota', type: 'number' },
      { name: 'teamSubmitted', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'ownerApproved', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'brandSelected', type: 'number', notes: 'Found in agencyData.js only.' },
      { name: 'dueDate', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'budget', type: 'string', notes: 'Found in agencyData.js only; includes formatted currency text.' },
      { name: 'startDate', type: 'string', notes: 'Found in MockupDashboard DB only.' },
      { name: 'deadlineDate', type: 'string', notes: 'Found in MockupDashboard DB only.' },
      { name: 'target', type: 'number', notes: 'Found in MockupDashboard DB only.' },
      { name: 'briefFile', type: 'string | null', notes: 'Found in MockupDashboard DB only.' },
      { name: 'briefVersion', type: 'string | null', notes: 'Found in MockupDashboard DB only.' },
      { name: 'briefDate', type: 'string | null', notes: 'Found in MockupDashboard DB only.' },
      { name: 'tierStats', type: 'object', notes: 'Found in MockupDashboard DB only.' },
    ],
    relationships: [
      'Many campaigns belong to one brand via brandId or nested DB.brands[].campaigns.',
      'One campaign has many influencers in MockupDashboard via nested campaign.influencers.',
      'One campaign has many tier target/stat rows via tierTargets or tierStats.',
      'Brief versions appear related to campaigns, but no campaignId field exists in briefVersions.',
    ],
    todos: ['Confirm date formats, money storage, status enum values, and whether numeric counters are persisted or derived.'],
  },
  {
    tableName: 'influencers',
    source: 'frontend/src/mock/agencyData.js: influencers; frontend/src/pages/MockupDashboard.jsx: campaign.influencers',
    purpose: 'Stores influencer candidates, approval state, production state, and posting links.',
    fields: [
      { name: 'id', type: 'string', notes: 'agencyData.js uses strings; MockupDashboard uses numbers.' },
      { name: 'name', type: 'string' },
      { name: 'channel', type: 'string', notes: 'Single channel format found in agencyData.js and some MockupDashboard rows.' },
      { name: 'channels', type: 'array', notes: 'Array of { type, url } found in MockupDashboard rows.' },
      { name: 'tier', type: 'string' },
      { name: 'followers', type: 'string', notes: 'Stored as display text in current data.' },
      { name: 'addedBy', type: 'string' },
      { name: 'addedByRole', type: 'string', notes: 'Found in MockupDashboard DB only.' },
      { name: 'dealDate', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'draftStatus', type: 'string', notes: 'Found in agencyData.js only.' },
      { name: 'draft', type: 'string', notes: 'Found in MockupDashboard DB only.' },
      { name: 'productSent', type: 'boolean', notes: 'Found in agencyData.js only.' },
      { name: 'postDate', type: 'string' },
      { name: 'postLink', type: 'string' },
      { name: 'assetLink', type: 'string', notes: 'Found in MockupDashboard DB only.' },
      { name: 'bank', type: 'object | null', notes: 'Object fields observed: name, account, holder.' },
      { name: 'seniorApproval', type: 'object | null', notes: 'Object fields observed: name, approved.' },
    ],
    relationships: [
      'Influencers are displayed globally in agencyData.js without campaignId.',
      'Influencers are nested under campaigns in MockupDashboard DB.',
      'addedBy references a staff/user display name, but no users table exists yet.',
    ],
    todos: ['Confirm whether influencers are global profiles, campaign candidates, or both. Add campaignId only after real code requires it.'],
  },
  {
    tableName: 'tier_targets',
    source: 'frontend/src/mock/agencyData.js: tierTargets; frontend/src/pages/MockupDashboard.jsx: campaign.tierStats',
    purpose: 'Stores target and progress counts grouped by influencer tier.',
    fields: [
      { name: 'tier', type: 'string' },
      { name: 'target', type: 'number' },
      { name: 'ownerApproved', type: 'number' },
      { name: 'brandSelected', type: 'number' },
      { name: 'sourced', type: 'number', notes: 'Found in MockupDashboard tierStats only.' },
      { name: 'confirmed', type: 'number', notes: 'Found in MockupDashboard tierStats only.' },
      { name: 'posted', type: 'number', notes: 'Found in MockupDashboard tierStats only.' },
    ],
    relationships: ['Related to campaigns, but agencyData.js tierTargets does not include campaignId.'],
    todos: ['Confirm if tier targets are global defaults or per-campaign rows.'],
  },
  {
    tableName: 'brief_versions',
    source: 'frontend/src/mock/agencyData.js: briefVersions; frontend/src/pages/MockupDashboard.jsx: campaign brief fields',
    purpose: 'Stores uploaded campaign brief versions.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'uploadedAt', type: 'string' },
      { name: 'uploadedBy', type: 'string' },
      { name: 'briefFile', type: 'string | null', notes: 'Found as campaign field in MockupDashboard DB.' },
      { name: 'briefDate', type: 'string | null', notes: 'Found as campaign field in MockupDashboard DB.' },
    ],
    relationships: ['Likely belongs to a campaign, but no campaignId is present in existing briefVersions data.'],
    todos: ['Add campaign relation only after real backend/database code defines it.'],
  },
  {
    tableName: 'notifications',
    source: 'frontend/src/mock/agencyData.js: notifications',
    purpose: 'Stores role-scoped notification messages displayed in the topbar/dashboard.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'role', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'message', type: 'string' },
      { name: 'unread', type: 'boolean' },
      { name: 'time', type: 'string' },
    ],
    relationships: ['role matches demo role values. No persisted users table was found.'],
    todos: ['Confirm whether notifications should relate to users, roles, campaigns, or brands.'],
  },
  {
    tableName: 'activities',
    source: 'frontend/src/mock/agencyData.js: activities',
    purpose: 'Stores activity log rows shown in timelines.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'user', type: 'string' },
      { name: 'action', type: 'string' },
      { name: 'time', type: 'string' },
    ],
    relationships: ['user is a display name only. No users table or foreign key exists in source.'],
    todos: ['Confirm activity actor relation and whether campaign/brand/influencer references are required.'],
  },
  {
    tableName: 'tasks',
    source: 'frontend/src/mock/agencyData.js: tasks',
    purpose: 'Stores task rows for team/content work tracking.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'owner', type: 'string' },
      { name: 'due', type: 'string' },
      { name: 'status', type: 'string' },
    ],
    relationships: ['owner is a display name/role only. No users table or campaign relation exists in source.'],
    todos: ['Confirm task ownership, due date type, and optional campaign/influencer relations.'],
  },
  {
    tableName: 'seniors',
    source: 'frontend/src/pages/MockupDashboard.jsx: DB.seniors',
    purpose: 'Stores senior reviewer names used by mock approval flow.',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'role', type: 'string' },
    ],
    relationships: ['Referenced by influencer.seniorApproval.name as display text, not by id.'],
    todos: ['Confirm whether seniors are users with a role or a separate lookup.'],
  },
]

export const backendApiReference = [
  {
    method: 'GET',
    path: '/api',
    purpose: 'API status and endpoint list.',
    response: { name: 'AgencyHub API', status: 'ok', endpoints: ['GET /api/health'] },
  },
  {
    method: 'GET',
    path: '/api/health',
    purpose: 'Backend readiness check.',
    response: { status: 'ok' },
  },
  {
    method: 'GET',
    path: '/api/mock-data',
    purpose: 'Returns all current mock-backed data collections for migration/testing.',
    response: 'roles, brands, campaigns, influencers, tasks, notifications, activities, tierTargets, briefVersions, draftStatuses, currentStaffName',
  },
  {
    method: 'GET',
    path: '/api/brands',
    purpose: 'Returns brand records discovered in frontend/src/mock/agencyData.js.',
    response: 'brands[]',
  },
  {
    method: 'GET',
    path: '/api/brands/:id',
    purpose: 'Returns one brand record by id.',
    response: 'brand',
  },
  {
    method: 'GET',
    path: '/api/campaigns',
    purpose: 'Returns campaign records discovered in frontend/src/mock/agencyData.js.',
    response: 'campaigns[]',
  },
  {
    method: 'GET',
    path: '/api/campaigns/:id',
    purpose: 'Returns one campaign record by id.',
    response: 'campaign',
  },
  {
    method: 'GET',
    path: '/api/influencers',
    purpose: 'Returns influencer records discovered in frontend/src/mock/agencyData.js.',
    response: 'influencers[]',
  },
  {
    method: 'GET',
    path: '/api/tasks',
    purpose: 'Returns task records discovered in frontend/src/mock/agencyData.js.',
    response: 'tasks[]',
  },
]
