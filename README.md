# CRUD Mono Repo

A minimal monorepo with:

- React frontend in `apps/web`
- Node + Express API in `apps/api`
- Shared package in `packages/shared`

This app uses an in-memory array instead of a database for now.

## Run locally

```bash
npm install
npm run dev
```

Then open:

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/items

## Build

```bash
npm run build
```
