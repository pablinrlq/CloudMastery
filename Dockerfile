# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# Separate target used by the EC2 script to apply migrations with pg/dotenv.
FROM deps AS migrator
COPY db ./db
COPY package.json package-lock.json ./
CMD ["node", "db/run-migrations.mjs"]

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S cloudmastery -g 1001 && adduser -S cloudmastery -u 1001 -G cloudmastery

COPY --from=builder --chown=cloudmastery:cloudmastery /app/.next/standalone ./
COPY --from=builder --chown=cloudmastery:cloudmastery /app/.next/static ./.next/static
COPY --from=builder --chown=cloudmastery:cloudmastery /app/public ./public
# Course content is read from the filesystem at request time.
COPY --from=builder --chown=cloudmastery:cloudmastery /app/content ./content

USER cloudmastery
EXPOSE 3000
CMD ["node", "server.js"]
