# ---------- Build stage: compile TypeScript ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (use lockfile if present)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and tsconfig, then build to /app/dist
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npx tsc

# ---------- Runtime stage: minimal prod image ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only install production deps
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# The app reads PORT from env; default 4000
EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"]
