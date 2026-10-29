# CRUD Mono Repo

An npm-workspaces monorepo:

| Path              | What                                                         |
| ----------------- | ------------------------------------------------------------ |
| `apps/web`        | React + Vite frontend                                        |
| `apps/api`        | Node + Express API (also serves the built frontend in prod)  |
| `packages/shared` | Shared code (`@crud/shared`) used by both apps               |

Data is kept in an in-memory array, so it resets whenever the server restarts.

## Requirements

- Node.js 20.19+ (see `.nvmrc`, which pins 22)
- Docker (optional, for container builds)

## Local development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to the API)
- API: http://localhost:4000/api/items (restarts on file changes)

## Scripts

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Run API + web dev servers together              |
| `npm test`            | Run tests in every workspace                    |
| `npm run build`       | Build the frontend into `apps/web/dist`         |
| `npm start`           | Start the API, serving the built frontend       |
| `npm run docker:up`   | Build and run the app with Docker Compose       |
| `npm run docker:down` | Stop the Compose stack                          |

## Production (without Docker)

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

Open http://localhost:4000. One Node process serves both the API (`/api/*`) and the React app, so there's only one service to deploy and no CORS setup needed.

## Production (Docker)

```bash
docker compose up --build -d
# or
docker build -t crud-monorepo .
docker run -p 4000:4000 crud-monorepo
```

The `Dockerfile` is a multi-stage build. It compiles the frontend, then ships a small `node:22-alpine` image containing only the API's production dependencies and the built assets. The image runs as a non-root user and has a `/health` healthcheck.

## Configuration

Copy `.env.example` to `.env` and adjust as needed.

| Variable       | Default | Purpose                                                        |
| -------------- | ------- | -------------------------------------------------------------- |
| `PORT`         | `4000`  | Port to listen on (most hosts set this for you)                |
| `HOST`         | `0.0.0.0` | Interface to bind                                            |
| `CORS_ORIGIN`  | (any)   | Comma-separated allowlist, only needed if the web app is hosted on a different origin |
| `WEB_DIST_DIR` | `apps/web/dist` | Where the built frontend lives                         |

## Deploying

- **Container hosts** (Render, Railway, Fly.io, Cloud Run, ECS, a VPS): point them at the `Dockerfile`. Health check path: `/health`.
- **Node hosts without Docker**: build command `npm ci && npm run build`, start command `npm start`.

## CI

`.github/workflows/ci.yml` runs tests, the frontend build, and a Docker image build on every push to `main` and on every pull request.
