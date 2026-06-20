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
6. Pull env vars locally or copy the database URL into `.env.local`.
7. Run the migration and seed scripts.
8. Redeploy Vercel.

```bash
vercel env pull .env.local
npm run db:migrate
npm run db:seed
vercel --prod
```

If you use an online SQL runner that says `cannot insert multiple commands into a prepared statement`, do not paste the whole SQL file into one prepared query. Use the scripts above; they split the file and run each SQL statement one at a time.

## Test

After deploy:

```bash
curl https://your-domain.vercel.app/api/db-status
curl https://your-domain.vercel.app/api/brands
curl https://your-domain.vercel.app/api/campaigns
```

Locally, set `DATABASE_URL` in `.env` or in the shell before starting the backend. If `DATABASE_URL` is not set, the API falls back to existing mock seed data.
