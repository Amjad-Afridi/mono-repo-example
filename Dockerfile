# syntax=docker/dockerfile:1

# ---- deps: install all workspace dependencies (cached on lockfile changes only)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci

# ---- build: compile the React app
FROM deps AS build
COPY . .
RUN npm run build

# ---- runtime: production deps only + API source + built web assets
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci --omit=dev --workspace api --include-workspace-root=false && npm cache clean --force
COPY packages/shared packages/shared
COPY apps/api apps/api
COPY --from=build /app/apps/web/dist apps/web/dist

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1
CMD ["node", "apps/api/server.js"]
