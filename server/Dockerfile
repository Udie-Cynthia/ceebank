# ---------- Builder: compile TypeScript ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install only server deps
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy tsconfig and source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# DEBUG: prove the file exists inside the build context
RUN echo "---- listing src ----" && ls -la src && \
    echo "---- listing src/routes ----" && ls -la src/routes || true

# Compile TS -> JS
RUN npx tsc

# ---------- Runtime: minimal image ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 4000

# Copy compiled JS and production deps only
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]

