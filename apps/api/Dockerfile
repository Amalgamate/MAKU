# ─── Base ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# ─── Development ────────────────────────────────────────────────────────────
FROM base AS development
WORKDIR /app/apps/api
ENV NODE_ENV=development
CMD ["pnpm", "dev"]

# ─── Build ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app/apps/api
RUN pnpm exec tsc -p /app/packages/shared-types/tsconfig.json && pnpm build

# ─── Production ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
RUN npm install -g pnpm@12.8.1
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

# Production deps only
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3000

# Schema initialization is performed once by the deployment script on a fresh DB.
CMD ["node", "dist/main.js"]
