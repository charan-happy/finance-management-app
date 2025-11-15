# Multi-stage Dockerfile for Vite + React + Netlify Functions (Node backend)
# Stage 1: Build dependencies and frontend
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install dependencies (prisma schema must be present before postinstall runs)
COPY package*.json ./

# Copy Prisma schema before installing so `prisma generate` (postinstall) can run
#COPY prisma ./prisma
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-bullseye-slim

WORKDIR /app

# Install only production dependencies
COPY package*.json ./

# Copy Prisma schema before running postinstall (prisma generate runs in postinstall)
# so the schema is available during npm install.
#COPY prisma ./prisma
RUN npm ci --only=production

# Copy node_modules from builder to make the Prisma CLI and dev tools available
# for runtime schema push (this keeps production install but allows npx prisma to run).
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist

# Copy netlify functions
#COPY netlify ./netlify

# Copy server entry (TypeScript) so tsx can run it at container start
#COPY server.ts ./

# Expose port 3000
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Copy startup script and make it executable
#COPY scripts/start.sh ./scripts/start.sh
#RUN chmod +x ./scripts/start.sh

# Use the entrypoint script — it will run prisma db push when PRISMA_AUTO_PUSH=true
#ENTRYPOINT ["/app/scripts/start.sh"]
ENTRYPOINT ["npm run dev"]

