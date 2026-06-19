# AgencyHub Backend

Minimal Node.js backend for AgencyHub.

This backend currently has no database connection, ORM, authentication, or secret-dependent integrations. Database information discovered from the existing frontend mockup is documented in `designdata.ts`.

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

## Environment

Copy `.env.example` values into your deployment environment as needed. Do not commit real API keys, database URLs, secrets, or credentials.

## Vercel

Vercel uses the root `api/[...path].js` catch-all function and the shared request handler in `backend/src/app.js`.

After deployment, test:

```bash
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/brands
```
