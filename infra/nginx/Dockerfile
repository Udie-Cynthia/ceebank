# Nginx + Certbot (Alpine) reverse proxy for ceebank.online
# - Serves the built client from /usr/share/nginx/html (mount or COPY in your deploy step)
# - Proxies /api -> backend on http://server:4000 (see ceebank.conf)
# - Installs certbot + certbot-nginx to obtain/renew TLS certs
# NOTE: You will run certbot in the container/instance at deploy time; this Dockerfile only installs tools.

FROM nginx:1.27-alpine

# Install certbot + certbot-nginx plugin
RUN apk add --no-cache certbot certbot-nginx bash curl

# Copy nginx site config
COPY ceebank.conf /etc/nginx/conf.d/ceebank.conf

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -fsS http://localhost/health || curl -fsS http://127.0.0.1/ || exit 1

# Expose HTTP and HTTPS
EXPOSE 80 443

# Default command: run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
