FROM node:20-alpine AS base

# Install OpenSSL for Prisma and libc6-compat for next/image
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package.json frontend/package-lock.json* ./

# Copy only schema to local ./prisma to avoid copying seed.ts (which causes build errors)
COPY backend/prisma/schema.prisma ./prisma/schema.prisma

# Install deps but skip postinstall (which uses ../backend path)
RUN npm install --ignore-scripts

# Generate client using local schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy frontend source code
COPY frontend/ .

# Copy schema again for builder stage
COPY backend/prisma/schema.prisma ./prisma/schema.prisma

ENV NEXT_TELEMETRY_DISABLED=1

# Generate client again (needed if node_modules were pruned or just to be safe)
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
