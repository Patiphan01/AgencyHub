# AgencyHub Database

Recommended database: Neon Postgres connected through the Vercel Marketplace.

Vercel's current Postgres docs state that Vercel Postgres is no longer available for new projects, and new projects should install a Postgres integration from the Marketplace. Neon is the natural default because older Vercel Postgres databases were migrated to Neon.

## Files

- `migrations/001_initial_schema.sql` creates the tables and indexes.
- `seeds/001_seed_from_current_mock.sql` inserts the current frontend mock records as initial seed data.

## Setup With Neon + Vercel

1. Open your Vercel project.
2. Go to Storage or Marketplace.
3. Add a Postgres provider, recommended: Neon.
4. Connect it to this project.
5. Make sure Vercel creates/injects `DATABASE_URL`.
6. Open the Neon SQL Editor.
7. Run `migrations/001_initial_schema.sql`.
8. Run `seeds/001_seed_from_current_mock.sql`.
9. Redeploy Vercel.

## Test

After deploy:

```bash
curl https://your-domain.vercel.app/api/db-status
curl https://your-domain.vercel.app/api/brands
curl https://your-domain.vercel.app/api/campaigns
```

Locally, set `DATABASE_URL` in `.env` or in the shell before starting the backend. If `DATABASE_URL` is not set, the API falls back to existing mock seed data.
