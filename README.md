# CRUD Mono Repo

A minimal monorepo with:

- React frontend in `apps/web`
- Node + Express API in `apps/api`
- Shared package in `packages/shared`

This app uses an in-memory array instead of a database for now and is set up for simple deployment testing.

## Run locally

```bash
npm install
npm run dev
```

Then open:

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/items

## Production-style run

```bash
npm install
npm run build
npm start
```

Then open the app at:

- http://localhost:4000

## Notes

- The frontend uses a host-relative API path so it works on deployed hosts without hardcoded `localhost` values.
- The API is configured to use `PORT` from the environment when available.
- The frontend dev server proxies `/api` to the Node API during local development.
