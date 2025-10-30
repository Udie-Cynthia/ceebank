# ---------- Build stage: Vite production build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps using lockfile if present (include dev deps)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi


# Copy source and build
COPY tsconfig.json ./tsconfig.json
COPY index.html ./index.html
COPY public ./public
COPY src ./src
RUN npm run build

# ---------- Runtime stage: Nginx to serve static files ----------
FROM nginx:1.27-alpine AS runtime
# Copy build output to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Basic security/ops tweaks
# - Remove default nginx server tokens
RUN sed -i "s/# server_tokens off;/server_tokens off;/" /etc/nginx/nginx.conf

# Expose port 80 for HTTP (will sit behind a load balancer / reverse proxy with TLS)
EXPOSE 80

# Default command (nginx in foreground)
CMD ["nginx", "-g", "daemon off;"]
