# AgencyHub

AgencyHub is a frontend-only React mockup for an influencer campaign management system used by an agency.

This version uses mock data only. It does not connect to a backend, database, or real authentication yet, but the code is organized so those pieces can be added later.

## Tech Stack

- React
- Vite
- React Router

The `backend/` folder is kept as a placeholder for future API, database, and authentication work.

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

The app runs on the Vite default port, usually `http://localhost:5173`.

## Mock Login

Open `/login`, choose a demo role, and submit the form.

Available mock roles:

- Brand
- Owner
- Staff

After mock login, the app navigates to `/dashboard`.

## Main Routes

- `/login`
- `/dashboard`
- `/brands`
- `/brands/:brandId`
- `/campaigns`
- `/campaigns/:campaignId`
- `/influencers`
- `/clients`
- `/projects`
- `/tasks`
- `/invoices`
- `/settings`
- `/users`

## Notes

- Mock data lives in `frontend/src/mock/agencyData.js`.
- Shared UI components live in `frontend/src/components`.
- The dashboard and sidebar change based on the selected mock role.
- Backend and database integration can be added later without changing the current UI structure.
