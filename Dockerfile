# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder-base
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM builder-base AS build-staging
COPY .env.staging.sample .env.production
RUN npm run build

FROM builder-base AS build-production
COPY .env.production.sample .env.production
RUN npm run build

FROM base AS runner-base
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

FROM runner-base AS staging
COPY --from=build-staging /app/public ./public
COPY --from=build-staging --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build-staging --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]

FROM runner-base AS production
COPY --from=build-production /app/public ./public
COPY --from=build-production --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build-production --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]
