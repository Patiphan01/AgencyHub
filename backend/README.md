# AgencyHub Backend

Minimal Node.js backend for AgencyHub.

This backend supports Postgres through `DATABASE_URL`. If `DATABASE_URL` is not configured yet, read endpoints fall back to the current frontend mock seed data so the API stays testable during setup.

## Run Locally

From the project root:

```bash
npm run backend:dev
```

Or from this folder:

```bash
npm run dev
```

The backend defaults to `http://localhost:3001`.

## Endpoints

- `GET /api` returns the API status and endpoint list
- `GET /api/health` returns `{ "status": "ok" }`
- `GET /api/db-status` returns database configuration/connection status
- `GET /api/dashboard` returns the nested app data used by the role-based frontend
- `GET /api/mock-data` returns all current mock-backed data collections
- `GET /api/roles`
- `GET /api/brands`
- `GET /api/brands/:id`
- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `GET /api/influencers`
- `GET /api/tasks`
- `GET /api/notifications`
- `GET /api/activities`
- `GET /api/tier-targets`
- `GET /api/brief-versions`
- `GET /api/draft-statuses`
- `GET /api/current-staff`
- `PATCH /api/influencers/:id` updates influencer status/content fields when `DATABASE_URL` is configured

## Environment

Copy `.env.example` values into your deployment environment as needed. Do not commit real API keys, database URLs, secrets, or credentials.

Recommended database: Neon Postgres via the Vercel Marketplace. Run the SQL files in `backend/db` to create and seed the database.

## Vercel

Vercel uses the root `api/[...path].js` catch-all function and the shared request handler in `backend/src/app.js`.

After deployment, test:

```bash
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/db-status
curl https://your-domain.vercel.app/api/dashboard
curl https://your-domain.vercel.app/api/brands
```
